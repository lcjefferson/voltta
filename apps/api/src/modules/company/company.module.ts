import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Patch,
} from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { Prisma, RoleCode } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthUser,
  CurrentUser,
  Roles,
} from '../../common/decorators/auth.decorators';
import {
  DEFAULT_BUSINESS_HOURS,
  normalizeBusinessHours,
} from '../../common/business-hours';

class CompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsObject()
  businessHours?: Record<string, unknown>;
}

class SettingsDto {
  value!: object;
}

@Injectable()
class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async get(companyId: string) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    return {
      ...company,
      businessHours: normalizeBusinessHours(company.businessHours),
    };
  }

  async update(companyId: string, dto: CompanyDto) {
    const data: Prisma.CompanyUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.businessHours !== undefined) {
      data.businessHours = normalizeBusinessHours(
        dto.businessHours,
      ) as unknown as Prisma.InputJsonValue;
    }

    const company = await this.prisma.company.update({
      where: { id: companyId },
      data,
    });
    return {
      ...company,
      businessHours: normalizeBusinessHours(company.businessHours),
    };
  }

  async settings(companyId: string) {
    return (
      (
        await this.prisma.setting.findUnique({
          where: { companyId_key: { companyId, key: 'onboarding' } },
        })
      )?.value || { completed: false }
    );
  }

  async updateSettings(companyId: string, value: object) {
    return this.prisma.setting.upsert({
      where: { companyId_key: { companyId, key: 'onboarding' } },
      create: {
        companyId,
        key: 'onboarding',
        value: value as Prisma.InputJsonValue,
      },
      update: { value: value as Prisma.InputJsonValue },
    });
  }
}

@Controller('company')
class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  get(@CurrentUser() u: AuthUser) {
    return this.service.get(u.companyId);
  }

  @Roles(RoleCode.ADMIN)
  @Patch()
  update(@CurrentUser() u: AuthUser, @Body() dto: CompanyDto) {
    return this.service.update(u.companyId, dto);
  }

  @Get('onboarding')
  settings(@CurrentUser() u: AuthUser) {
    return this.service.settings(u.companyId);
  }

  @Patch('onboarding')
  settingsUpdate(@CurrentUser() u: AuthUser, @Body() dto: SettingsDto) {
    return this.service.updateSettings(u.companyId, dto.value);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}

export { DEFAULT_BUSINESS_HOURS };
