import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreatePropertyDto, ownerId: string) {
    const property = await this.prisma.property.create({
      data: { ...dto, ownerId },
      include: { units: true },
    });
    
    await this.auditService.log({
      userId: ownerId,
      action: 'CREATE',
      entity: 'PROPERTY',
      entityId: property.id,
      newValue: property,
    });
    
    return property;
  }

  async findAll(query: QueryPropertyDto, ownerId: string, role: string) {
    const page = parseInt(query.page as any) || 1;
    const limit = parseInt(query.limit as any) || 10;
    const { search, city, country, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (role !== 'ADMIN') where.ownerId = ownerId;
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = country;

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          units: { where: { deletedAt: null } },
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: { units: { where: { deletedAt: null } }, shareholders: true }
          }
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        units: { where: { deletedAt: null } },
        shareholders: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, userId: string) {
    const old = await this.findOne(id);
    const updated = await this.prisma.property.update({
      where: { id },
      data: dto,
      include: { units: true },
    });
    
    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'PROPERTY',
      entityId: id,
      oldValue: old,
      newValue: updated,
    });
    
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    const property = await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    await this.auditService.log({
      userId,
      action: 'DELETE',
      entity: 'PROPERTY',
      entityId: id,
    });
    
    return property;
  }

  async importExcel(buffer: Buffer, ownerId: string) {
    if (!buffer) throw new BadRequestException('لم يتم رفع أي ملف');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new BadRequestException('ملف الإكسل فارغ');

    const errors: string[] = [];
    let successCount = 0;

    // A: Name(1), B: Address(2), C: City(3), D: State(4), E: Country(5), F: ZipCode(6), G: Description(7), H: MapUrl(8)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (!row.hasValues) continue;

      const values = row.values as any[];
      
      const getVal = (idx: number) => values[idx]?.toString()?.trim();
      const getFloat = (idx: number) => {
        const v = values[idx];
        return v ? parseFloat(v.toString()) : undefined;
      };

      const name = getVal(1);
      const address = getVal(2);
      const city = getVal(3);
      
      if (!name || !address || !city) {
         errors.push(`السطر ${rowNumber}: بيانات ناقصة (الاسم، العنوان، أو المدينة)`);
         continue;
      }

      const dto: CreatePropertyDto = {
        name,
        address,
        city,
        state: getVal(4),
        country: getVal(5) || 'العراق',
        zipCode: getVal(6),
        description: getVal(7),
        mapUrl: getVal(8),
        issuer: getVal(9) || '',
        registrationDirectorate: getVal(10) || '',
        formType: getVal(11) || '',
        governorate: getVal(12) || '',
        district: getVal(13) || '',
        subDistrict: getVal(14),
        street: getVal(15),
        recordNumber: getVal(16) || '',
        recordDate: getVal(17) || '',
        recordVolume: getVal(18) || '',
        prevRecordNumber: getVal(19) || '',
        prevRecordDate: getVal(20) || '',
        prevRecordVolume: getVal(21) || '',
        propertySequence: getVal(22) || '',
        neighborhoodName: getVal(23) || '',
        doorNumber: getVal(24),
        plotNumber: getVal(25),
        sectionNumber: getVal(26),
        sectionName: getVal(27),
        ownerNationality: getVal(28) || '',
        boundaries: getVal(29),
        propertyGender: getVal(30) || '',
        propertyTypeDetailed: getVal(31) || '',
        contents: getVal(32),
        easements: getVal(33),
        areaSqm: getFloat(34) || 0,
        areaOlk: getFloat(35),
        areaDonum: getFloat(36),
        registrationNature: getVal(37) || '',
        insuranceNotes: getVal(38),
        deedRuling: getVal(39),
        requestingEntity: getVal(40) || '',
        certificationDate: getVal(41) || '',
        seals: getVal(42) || '',
      };

      try {
        await this.create(dto, ownerId);
        successCount++;
      } catch (error: any) {
        errors.push(`السطر ${rowNumber}: ${error.message || 'خطأ غير معروف'}`);
      }
    }

    return {
      success: true,
      successCount,
      errorsCount: errors.length,
      errors
    };
  }
}
