import { Module, forwardRef } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { JournalEntryNumberService } from './journal-entry-number.service';
import { AccountModule } from '../account/account.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { FiscalPeriodModule } from '../fiscal-period/fiscal-period.module';
import { FxModule } from '../fx/fx.module';
import { ApprovalModule } from '../approval/approval.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PrismaModule,
    AccountModule,
    forwardRef(() => FiscalPeriodModule),
    forwardRef(() => FxModule),
    forwardRef(() => ApprovalModule),
    forwardRef(() => UserModule),
  ],
  controllers: [JournalController],
  providers: [JournalService, JournalEntryNumberService],
  exports: [JournalService],
})
export class JournalModule {}
