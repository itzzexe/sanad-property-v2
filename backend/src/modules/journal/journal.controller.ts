import { Controller, Get, Post, Body, Param, Query, Delete, Req, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ReverseJournalEntryDto } from './dto/reverse-journal-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// @ts-ignore
import { JournalStatus, JournalSourceType, UserRole } from '@prisma/client';
import { ApprovalService } from '../approval/approval.service';
import { UserService } from '../user/user.service';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalController {
  constructor(
    private readonly journalService: JournalService,
    private readonly approvalService: ApprovalService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async create(@Body() dto: CreateJournalEntryDto, @Req() req: any) {
    const user = req.user;
    const userId = user?.sub || user?.id || 'system';
    const userRole = user?.role || 'OWNER';

    // Create the journal entry (service validates parent-account rule)
    const entry = await this.journalService.create(dto, userId, userRole);

    // Determine if this user can post directly (no approval needed)
    const isAdmin = userRole === 'ADMIN';
    const canDirectlyPost = isAdmin || await this.userService.hasPermission(userId, userRole, 'JOURNAL_POST');

    if (!canDirectlyPost) {
      await this.approvalService.create({
        type: 'JOURNAL_ENTRY',
        entityId: entry.id,
        entityLabel: `${entry.entryNumber} — ${entry.description}`,
        requestedById: userId,
      });
      return { ...entry, requiresApproval: true };
    }

    return { ...entry, requiresApproval: false };
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: JournalStatus,
    @Query('sourceType') sourceType?: JournalSourceType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('fiscalPeriodId') fiscalPeriodId?: string,
    @Query('reference') reference?: string,
  ) {
    return this.journalService.findAll(
      { status, sourceType, fiscalPeriodId, reference,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate:   endDate   ? new Date(endDate)   : undefined },
      { page: parseInt(page, 10), limit: parseInt(limit, 10) },
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.journalService.findOne(id); }

  @Post(':id/post')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  postEntry(@Param('id') id: string, @Req() req: any) {
    return this.journalService.post(id, req.user?.sub || req.user?.id || 'system');
  }

  @Post(':id/reverse')
  @Roles(UserRole.ADMIN)
  reverseEntry(@Param('id') id: string, @Body() dto: ReverseJournalEntryDto, @Req() req: any) {
    return this.journalService.reverse(id, dto.reason, req.user?.sub || req.user?.id || 'system');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  remove(@Param('id') id: string) { return this.journalService.delete(id); }
}
