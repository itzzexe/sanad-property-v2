import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  readonly DEFAULT_ACCOUNT_RANGES = {
    ASSET:          { from: 1000, to: 1999 },
    LIABILITY:      { from: 2000, to: 2999 },
    EXPENSE:        { from: 3000, to: 3999 },
    REVENUE:        { from: 4000, to: 4999 },
    OFF_BALANCE_DR: { from: 5000, to: 5999 },
    OFF_BALANCE_CR: { from: 6000, to: 6999 },
  };

  async getSettings() {
    let settings = await this.prisma.systemSettings.findFirst();

    // If no settings exist yet, create default
    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: {
          organizationName: 'سند للعقارات',
          address: 'بغداد - المنصور',
          defaultCurrency: 'IQD',
          exchangeRateUSD: 1460.0,
          language: 'ar',
          accountTypeRanges: this.DEFAULT_ACCOUNT_RANGES as any,
        } as any,
      });
    }

    // Back-fill ranges if missing (existing rows before migration)
    if (!(settings as any).accountTypeRanges) {
      settings = await this.prisma.systemSettings.update({
        where: { id: settings.id },
        data: { accountTypeRanges: this.DEFAULT_ACCOUNT_RANGES as any } as any,
      });
    }

    return settings;
  }

  async updateSettings(data: UpdateSettingsDto, userId: string) {
    let settings = await this.prisma.systemSettings.findFirst();

    const payload: any = {
      organizationName: data.organizationName,
      address: data.address,
      defaultCurrency: data.defaultCurrency,
      exchangeRateUSD: data.exchangeRateUSD,
      language: data.language,
      logo: data.logo,
      ...(data.accountTypeRanges !== undefined && { accountTypeRanges: data.accountTypeRanges }),
    };

    if (!settings) {
      settings = await this.prisma.systemSettings.create({ data: payload });
    } else {
      settings = await this.prisma.systemSettings.update({
        where: { id: settings.id },
        data: payload,
      });
    }

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'SYSTEM_SETTINGS',
      entityId: settings.id,
      oldValue: null, // Simplified for brevity in this robust pass
      newValue: settings,
    });

    return settings;
  }
}
