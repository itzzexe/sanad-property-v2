import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalType } from '@prisma/client';
import { JournalService } from '../journal/journal.service';

@Injectable()
export class ApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => JournalService))
    private readonly journalService: JournalService,
  ) {}

  async create(data: {
    type: ApprovalType;
    entityId: string;
    entityLabel?: string;
    requestedById: string;
  }) {
    return this.prisma.approvalRequest.create({
      data: {
        type: data.type,
        entityId: data.entityId,
        entityLabel: data.entityLabel,
        requestedBy: data.requestedById,
        status: 'PENDING',
      },
    });
  }

  async findAll(query: { status?: string; type?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    return this.prisma.approvalRequest.findMany({
      where,
      include: {
        requester: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countPending(): Promise<number> {
    return this.prisma.approvalRequest.count({ where: { status: 'PENDING' } });
  }

  async getPendingForEntity(entityId: string) {
    return this.prisma.approvalRequest.findFirst({
      where: { entityId, status: 'PENDING' },
    });
  }

  async approve(id: string, reviewerId: string) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('طلب الموافقة غير موجود');
    if (req.status !== 'PENDING') throw new BadRequestException('تم مراجعة هذا الطلب مسبقاً');

    if (req.type === 'JOURNAL_ENTRY') {
      await this.journalService.post(req.entityId, reviewerId);
    } else if (req.type === 'ACCOUNT') {
      await this.prisma.account.update({
        where: { id: req.entityId },
        data: { isActive: true, pendingApproval: false },
      });
    }

    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: reviewerId },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewer:  { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async reject(id: string, reviewerId: string, note?: string) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('طلب الموافقة غير موجود');
    if (req.status !== 'PENDING') throw new BadRequestException('تم مراجعة هذا الطلب مسبقاً');

    // For pending accounts: delete the inactive/pending account entry
    if (req.type === 'ACCOUNT') {
      try {
        await this.prisma.account.delete({ where: { id: req.entityId } });
      } catch {
        // Already deleted or has references — ignore
      }
    }

    return this.prisma.approvalRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedBy: reviewerId, note },
    });
  }
}
