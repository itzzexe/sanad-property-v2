import { IsArray, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const ALL_PERMISSIONS = [
  'PROPERTY_VIEW', 'PROPERTY_CREATE', 'PROPERTY_EDIT', 'PROPERTY_DELETE',
  'UNIT_VIEW', 'UNIT_CREATE', 'UNIT_EDIT',
  'TENANT_VIEW', 'TENANT_CREATE', 'TENANT_EDIT',
  'CONTRACT_VIEW', 'CONTRACT_CREATE', 'CONTRACT_EDIT',
  'PAYMENT_VIEW', 'PAYMENT_CREATE',
  'ACCOUNT_VIEW', 'ACCOUNT_CREATE',
  'JOURNAL_VIEW', 'JOURNAL_CREATE', 'JOURNAL_POST',
  'REPORT_VIEW',
  'APPROVE_JOURNALS', 'APPROVE_ACCOUNTS', 'APPROVE_ALL',
  'USER_MANAGE',
] as const;

export type PermissionKey = typeof ALL_PERMISSIONS[number];

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], description: 'List of permission keys' })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
