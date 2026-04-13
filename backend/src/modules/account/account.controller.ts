import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AccountType } from '@prisma/client';
import { ApprovalService } from '../approval/approval.service';
import { UserService } from '../user/user.service';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly approvalService: ApprovalService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiQuery({ name: 'type', enum: ['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'], required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  findAll(@Query('type') type?: AccountType, @Query('isActive') isActive?: string) {
    return this.accountService.findAll({
      type,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get('tree')
  findTree() { return this.accountService.findTree(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.accountService.findOne(id); }

  @Get(':id/ledger')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getLedger(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountService.getLedger(id, { startDate, endDate });
  }

  @Get(':id/suggest-child-code')
  async suggestNextChildCode(@Param('id') id: string) {
    const nextCode = await this.accountService.suggestNextChildCode(id);
    return { code: nextCode };
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Post()
  @ApiOperation({ summary: 'Create account — requires approval if not Admin/Approver' })
  async create(@Body() dto: CreateAccountDto, @Req() req: any) {
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    let needsApproval = false;
    if (!isAdmin) {
      const canApprove = await this.userService.hasPermission(
        user.sub, user.role, 'APPROVE_ACCOUNTS',
      );
      needsApproval = !canApprove;
    }

    const account = await this.accountService.create(dto, needsApproval);

    if (needsApproval) {
      await this.approvalService.create({
        type: 'ACCOUNT',
        entityId: account.id,
        entityLabel: `${dto.code} - ${dto.name}`,
        requestedById: user.sub,
      });
    }

    return { ...account, pendingApproval: needsApproval };
  }

  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.accountService.delete(id); }
}
