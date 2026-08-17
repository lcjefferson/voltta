import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Patch,
} from '@nestjs/common';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { BusinessType, Prisma, RoleCode } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthUser,
  CurrentUser,
  Roles,
} from '../../common/decorators/auth.decorators';
import {
  DEFAULT_BUSINESS_HOURS,
  listOpenDates,
  normalizeBusinessHours,
} from '../../common/business-hours';

const RESERVED_SLUGS = new Set([
  'b',
  'blog',
  'login',
  'signup',
  'agendar',
  'agenda',
  'dashboard',
  'leads',
  'clientes',
  'configuracoes',
  'whatsapp',
  'assinatura',
  'onboarding',
  'api',
  'docs',
  'health',
  'ready',
  'para-barbearias',
  'para-saloes',
  'para-estetica',
  'admin',
  'app',
  'www',
]);

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

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

  /** Slug curto do link público /b/{slug} */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(48)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug inválido. Use letras minúsculas, números e hífen.',
  })
  slug?: string;

  /** URL http(s) ou data:image (logo comprimida no browser). null remove. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(900_000)
  logoUrl?: string | null;

  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

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
    const businessHours = normalizeBusinessHours(company.businessHours);
    return {
      ...company,
      businessHours,
      openDates: listOpenDates(businessHours, new Date(), 21),
    };
  }

  async update(companyId: string, dto: CompanyDto) {
    const data: Prisma.CompanyUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.businessType !== undefined) data.businessType = dto.businessType;
    if (dto.businessHours !== undefined) {
      data.businessHours = normalizeBusinessHours(
        dto.businessHours,
      ) as unknown as Prisma.InputJsonValue;
    }

    if (dto.slug !== undefined) {
      const slug = slugify(dto.slug);
      if (!slug || slug.length < 2) {
        throw new BadRequestException('Slug muito curto.');
      }
      if (RESERVED_SLUGS.has(slug)) {
        throw new BadRequestException('Este slug está reservado. Escolha outro.');
      }
      const taken = await this.prisma.company.findFirst({
        where: { slug, NOT: { id: companyId } },
        select: { id: true },
      });
      if (taken) {
        throw new BadRequestException('Este slug já está em uso.');
      }
      data.slug = slug;
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
