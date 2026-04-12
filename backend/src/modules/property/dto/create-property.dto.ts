import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'عقار المحلة 236' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'شارع الرشيد' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'بغداد' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'بغداد' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'Iraq' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapUrl?: string;

  // ── General Information ──────────────────────────────────
  @ApiProperty({ description: 'الجهة المصدرة' })
  @IsString()
  issuer: string;

  @ApiProperty({ description: 'مديرية التسجيل العقاري في' })
  @IsString()
  registrationDirectorate: string;

  @ApiProperty({ description: 'نوع النموذج' })
  @IsString()
  formType: string;

  // ── Current Permanent Record ──────────────────────────────
  @ApiProperty({ description: 'المحافظة' })
  @IsString()
  governorate: string;

  @ApiPropertyOptional({ description: 'القضاء', example: 'الرصافة' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'الناحية' })
  @IsOptional()
  @IsString()
  subDistrict?: string;

  @ApiPropertyOptional({ description: 'الشارع' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ description: 'العدد' })
  @IsString()
  recordNumber: string;

  @ApiProperty({ description: 'التاريخ' })
  @IsString()
  recordDate: string;

  @ApiProperty({ description: 'رقم المجلد' })
  @IsString()
  recordVolume: string;

  // ── Transferred From Record ───────────────────────────────
  @ApiProperty({ description: 'العدد (المنقول منه)' })
  @IsString()
  prevRecordNumber: string;

  @ApiProperty({ description: 'التاريخ (المنقول منه)' })
  @IsString()
  prevRecordDate: string;

  @ApiProperty({ description: 'رقم المجلد (المنقول منه)' })
  @IsString()
  prevRecordVolume: string;

  @ApiProperty({ description: 'تسلسل العقار' })
  @IsString()
  propertySequence: string;

  @ApiProperty({ description: 'اسم المحلة' })
  @IsString()
  neighborhoodName: string;

  @ApiPropertyOptional({ description: 'رقم الباب' })
  @IsOptional()
  @IsString()
  doorNumber?: string;

  @ApiPropertyOptional({ description: 'رقم القطعة' })
  @IsOptional()
  @IsString()
  plotNumber?: string;

  @ApiPropertyOptional({ description: 'رقم المقاطعة' })
  @IsOptional()
  @IsString()
  sectionNumber?: string;

  @ApiPropertyOptional({ description: 'اسم المقاطعة' })
  @IsOptional()
  @IsString()
  sectionName?: string;

  // ── Ownership & Property Details ──────────────────────────
  @ApiProperty({ description: 'المالك أو المتصرف وتابعيته' })
  @IsString()
  ownerNationality: string;

  @ApiPropertyOptional({ description: 'الحدود', example: 'كما في الخارطة' })
  @IsOptional()
  @IsString()
  boundaries?: string;

  @ApiProperty({ description: 'جنس العقار' })
  @IsString()
  propertyGender: string;

  @ApiProperty({ description: 'نوع العقار (الصنف)' })
  @IsString()
  propertyTypeDetailed: string;

  @ApiPropertyOptional({ description: 'المشتملات' })
  @IsOptional()
  @IsString()
  contents?: string;

  @ApiPropertyOptional({ description: 'حقوق الارتفاق والعقر' })
  @IsOptional()
  @IsString()
  easements?: string;

  @ApiPropertyOptional({ description: 'المساحة - متر مربع' })
  @IsOptional()
  @IsNumber()
  areaSqm?: number;

  @ApiPropertyOptional({ description: 'المساحة - اولك' })
  @IsOptional()
  @IsNumber()
  areaOlk?: number;

  @ApiPropertyOptional({ description: 'المساحة - دونم' })
  @IsOptional()
  @IsNumber()
  areaDonum?: number;

  // ── Registration Details ──────────────────────────────────
  @ApiProperty({ description: 'ماهية التسجيل ومستنداته' })
  @IsString()
  registrationNature: string;

  @ApiPropertyOptional({ description: 'اشارات التأمينات العينية والحجز' })
  @IsOptional()
  @IsString()
  insuranceNotes?: string;

  @ApiPropertyOptional({ description: 'حكم السند' })
  @IsOptional()
  @IsString()
  deedRuling?: string;

  @ApiPropertyOptional({ description: 'الجهة الطالبة' })
  @IsOptional()
  @IsString()
  requestingEntity?: string;

  @ApiPropertyOptional({ description: 'تاريخ التصديق' })
  @IsOptional()
  @IsString()
  certificationDate?: string;

  @ApiPropertyOptional({ description: 'الأختام' })
  @IsOptional()
  @IsString()
  seals?: string;
}
