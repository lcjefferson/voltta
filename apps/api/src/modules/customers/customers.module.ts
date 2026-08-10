import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { CustomerLifecycle, CustomerSource } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../../common/decorators/auth.decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';

class CustomerDto {
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsString()
  whatsapp?: string;
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsDateString()
  birthDate?: string;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}

class ListCustomersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CustomerLifecycle)
  stage?: CustomerLifecycle;
}

export function normalizePhone(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  // keep BR numbers with country code when possible
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string, p: ListCustomersDto) {
    const where = {
      companyId,
      deletedAt: null,
      ...(p.stage ? { lifecycleStage: p.stage } : { lifecycleStage: CustomerLifecycle.CUSTOMER }),
      ...(p.q
        ? {
            OR: [
              { name: { contains: p.q, mode: 'insensitive' as const } },
              { whatsapp: { contains: p.q } },
              { phone: { contains: p.q } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip: (p.page - 1) * p.limit,
        take: p.limit,
        orderBy:
          p.stage === CustomerLifecycle.LEAD
            ? { lastInboundAt: 'desc' }
            : { name: 'asc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, total, page: p.page, limit: p.limit };
  }

  create(companyId: string, dto: CustomerDto) {
    const whatsapp = normalizePhone(dto.whatsapp || dto.phone) || dto.whatsapp;
    return this.prisma.customer.create({
      data: {
        ...dto,
        whatsapp,
        phone: dto.phone || whatsapp,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        companyId,
        lifecycleStage: CustomerLifecycle.CUSTOMER,
        source: CustomerSource.MANUAL,
        convertedAt: new Date(),
      },
    });
  }

  async one(companyId: string, id: string) {
    const x = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { score: true },
    });
    if (!x) throw new NotFoundException('Cliente não encontrado');
    return x;
  }

  async update(companyId: string, id: string, dto: CustomerDto) {
    await this.one(companyId, id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.one(companyId, id);
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Cliente removido' };
  }

  /**
   * Contato via WhatsApp → Lead (não promove se já for CUSTOMER).
   */
  async upsertLeadFromWhatsapp(input: {
    companyId: string;
    whatsapp: string;
    name?: string | null;
    message?: string | null;
  }) {
    const whatsapp = normalizePhone(input.whatsapp);
    if (!whatsapp) return null;

    const existing = await this.prisma.customer.findFirst({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        OR: [{ whatsapp }, { phone: whatsapp }, { whatsapp: { endsWith: whatsapp.slice(-11) } }],
      },
    });

    const message = input.message?.slice(0, 500) || null;
    const displayName =
      input.name?.trim() ||
      existing?.name ||
      `Lead ${whatsapp.slice(-4)}`;

    if (existing) {
      return this.prisma.customer.update({
        where: { id: existing.id },
        data: {
          name:
            existing.name.startsWith('Lead ') && input.name?.trim()
              ? input.name.trim()
              : existing.name,
          whatsapp: existing.whatsapp || whatsapp,
          phone: existing.phone || whatsapp,
          lastInboundAt: new Date(),
          lastInboundMessage: message || existing.lastInboundMessage,
          // keep CUSTOMER if already converted
          lifecycleStage: existing.lifecycleStage,
          source:
            existing.source === CustomerSource.MANUAL &&
            existing.lifecycleStage === CustomerLifecycle.LEAD
              ? CustomerSource.WHATSAPP
              : existing.source,
        },
      });
    }

    return this.prisma.customer.create({
      data: {
        companyId: input.companyId,
        name: displayName,
        whatsapp,
        phone: whatsapp,
        lifecycleStage: CustomerLifecycle.LEAD,
        source: CustomerSource.WHATSAPP,
        lastInboundAt: new Date(),
        lastInboundMessage: message,
        notes: message ? `Primeiro contato WhatsApp: ${message}` : undefined,
      },
    });
  }

  /**
   * Ao gerar agenda → vira CLIENTE automaticamente.
   */
  async promoteToCustomer(input: {
    companyId: string;
    customerId?: string;
    whatsapp?: string;
    name?: string;
    source?: CustomerSource;
  }) {
    let customer = input.customerId
      ? await this.prisma.customer.findFirst({
          where: {
            id: input.customerId,
            companyId: input.companyId,
            deletedAt: null,
          },
        })
      : null;

    const whatsapp = normalizePhone(input.whatsapp);
    if (!customer && whatsapp) {
      customer = await this.prisma.customer.findFirst({
        where: {
          companyId: input.companyId,
          deletedAt: null,
          OR: [{ whatsapp }, { phone: whatsapp }],
        },
      });
    }

    if (!customer && whatsapp) {
      return this.prisma.customer.create({
        data: {
          companyId: input.companyId,
          name: input.name || `Cliente ${whatsapp.slice(-4)}`,
          whatsapp,
          phone: whatsapp,
          lifecycleStage: CustomerLifecycle.CUSTOMER,
          source: input.source || CustomerSource.BOOKING,
          convertedAt: new Date(),
        },
      });
    }

    if (!customer) {
      throw new NotFoundException('Contato não encontrado para conversão');
    }

    if (customer.lifecycleStage === CustomerLifecycle.CUSTOMER) {
      return this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: input.name && customer.name.startsWith('Lead ')
            ? input.name
            : customer.name,
        },
      });
    }

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        lifecycleStage: CustomerLifecycle.CUSTOMER,
        convertedAt: new Date(),
        name: input.name && customer.name.startsWith('Lead ')
          ? input.name
          : customer.name,
        source:
          customer.source === CustomerSource.WHATSAPP
            ? CustomerSource.WHATSAPP
            : input.source || CustomerSource.BOOKING,
      },
    });
  }
}

@Controller('customers')
class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query() p: ListCustomersDto) {
    return this.service.list(u.companyId, p);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CustomerDto) {
    return this.service.create(u.companyId, dto);
  }

  @Get(':id')
  one(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.one(u.companyId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: CustomerDto,
  ) {
    return this.service.update(u.companyId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.remove(u.companyId, id);
  }

  @Post(':id/convert')
  convert(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.promoteToCustomer({
      companyId: u.companyId,
      customerId: id,
      source: CustomerSource.MANUAL,
    });
  }
}

@Controller('leads')
class LeadsController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query() p: PaginationDto) {
    return this.service.list(u.companyId, {
      ...p,
      stage: CustomerLifecycle.LEAD,
    });
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController, LeadsController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
