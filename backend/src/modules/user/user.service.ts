import {
  Injectable, ConflictException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, createdAt: true, isActive: true,
        permissions: { select: { permission: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(u => ({
      ...u,
      permissions: u.permissions.map(p => p.permission),
    }));
  }

  async create(dto: CreateUserDto, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword },
    });

    await this.auditService.log({
      userId: adminId, action: 'CREATE', entity: 'USER', entityId: user.id,
      newValue: { email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` },
    });

    const { password, ...result } = user;
    return result;
  }

  async updateStatus(id: string, isActive: boolean, adminId: string) {
    const user = await this.prisma.user.update({ where: { id }, data: { isActive } });
    await this.auditService.log({
      userId: adminId, action: 'UPDATE_STATUS', entity: 'USER', entityId: id,
      newValue: { isActive },
    });
    return user;
  }

  async remove(id: string, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id }, data: { deletedAt: new Date(), isActive: false },
    });
    await this.auditService.log({
      userId: adminId, action: 'DELETE', entity: 'USER', entityId: id,
    });
    return user;
  }

  // ── Permissions ───────────────────────────────────────────

  async getUserPermissions(userId: string): Promise<string[]> {
    const perms = await this.prisma.userPermission.findMany({
      where: { userId },
      select: { permission: true },
    });
    return perms.map(p => p.permission as string);
  }

  async setPermissions(userId: string, permissions: string[], grantedBy: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    // ADMIN always has all permissions — no need to store
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin users have all permissions by default');
    }

    await this.prisma.userPermission.deleteMany({ where: { userId } });

    if (permissions.length > 0) {
      await this.prisma.userPermission.createMany({
        data: permissions.map(p => ({
          userId,
          permission: p as any,
          grantedBy,
        })),
        skipDuplicates: true,
      });
    }

    await this.auditService.log({
      userId: grantedBy, action: 'UPDATE', entity: 'USER', entityId: userId,
      newValue: { permissions },
    });

    return { userId, permissions };
  }

  async hasPermission(userId: string, userRole: string, permission: string): Promise<boolean> {
    if (userRole === 'ADMIN') return true;
    const perm = await this.prisma.userPermission.findUnique({
      where: { userId_permission: { userId, permission: permission as any } },
    });
    // Also check APPROVE_ALL grants all approve rights
    if (!perm && permission.startsWith('APPROVE_')) {
      const approveAll = await this.prisma.userPermission.findUnique({
        where: { userId_permission: { userId, permission: 'APPROVE_ALL' as any } },
      });
      return !!approveAll;
    }
    return !!perm;
  }
}
