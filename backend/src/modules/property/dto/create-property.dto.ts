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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationDirectorate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordVolume?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prevRecordNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prevRecordDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prevRecordVolume?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertySequence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  neighborhoodName?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerNationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  boundaries?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyGender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyTypeDetailed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contents?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  areaSqm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  areaOlk?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  areaDonum?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationNature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deedRuling?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestingEntity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificationDate?: string;
}
