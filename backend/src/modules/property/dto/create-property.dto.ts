import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunrise Tower' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'A luxury residential tower' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'https://goo.gl/maps/...' })
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiProperty()
  @IsString()
  issuer: string;

  @ApiProperty()
  @IsString()
  registrationDirectorate: string;

  @ApiProperty()
  @IsString()
  formType: string;

  @ApiProperty()
  @IsString()
  governorate: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty()
  @IsString()
  recordNumber: string;

  @ApiProperty()
  @IsString()
  recordDate: string;

  @ApiProperty()
  @IsString()
  recordVolume: string;

  @ApiProperty()
  @IsString()
  prevRecordNumber: string;

  @ApiProperty()
  @IsString()
  prevRecordDate: string;

  @ApiProperty()
  @IsString()
  prevRecordVolume: string;

  @ApiProperty()
  @IsString()
  propertySequence: string;

  @ApiProperty()
  @IsString()
  neighborhoodName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doorNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plotNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sectionNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sectionName?: string;

  @ApiProperty()
  @IsString()
  ownerNationality: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  boundaries?: string;

  @ApiProperty()
  @IsString()
  propertyGender: string;

  @ApiProperty()
  @IsString()
  propertyTypeDetailed: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contents?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easements?: string;

  @ApiProperty()
  @IsNumber()
  areaSqm: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  areaOlk?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  areaDonum?: number;

  @ApiProperty()
  @IsString()
  registrationNature: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deedRuling?: string;

  @ApiProperty()
  @IsString()
  requestingEntity: string;

  @ApiProperty()
  @IsString()
  certificationDate: string;

  @ApiProperty()
  @IsString()
  seals: string;
}
