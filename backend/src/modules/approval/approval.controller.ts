import {
  Controller, Get, Post, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Get()
  @ApiOperation({ summary: 'List approval requests' })
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.approvalService.findAll({ status, type });
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Get('count/pending')
  @ApiOperation({ summary: 'Count pending approvals' })
  async countPending() {
    const count = await this.approvalService.countPending();
    return { count };
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  approve(@Param('id') id: string, @Req() req: any) {
    return this.approvalService.approve(id, req.user?.sub || req.user?.id);
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  reject(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.approvalService.reject(id, req.user?.sub || req.user?.id, note);
  }
}
