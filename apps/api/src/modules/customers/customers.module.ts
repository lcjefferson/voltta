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

class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;
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
  let digits = value.replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return null;
  // BR local (DDD+número) → com 55
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  // Já com país 55
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  return digits;
}

/** Variantes do mesmo número (com/sem 55, com/sem 9º dígito) para match de lead. */
export function phoneMatchCandidates(value: string): string[] {
  const canonical = normalizePhone(value);
  if (!canonical) return [];
  const set = new Set<string>([canonical]);
  const local = canonical.startsWith('55') ? canonical.slice(2) : canonical;
  set.add(local);
  set.add(`55${local}`);
  if (local.length === 11 && local[2] === '9') {
    const withoutNine = `${local.slice(0, 2)}${local.slice(3)}`;
    set.add(withoutNine);
    set.add(`55${withoutNine}`);
  }
  if (local.length === 10) {
    const withNine = `${local.slice(0, 2)}9${local.slice(2)}`;
    set.add(withNine);
    set.add(`55${withNine}`);
  }
  return [...set];
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

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.one(companyId, id);
    const whatsapp =
      dto.whatsapp !== undefined || dto.phone !== undefined
        ? normalizePhone(dto.whatsapp || dto.phone) || dto.whatsapp
        : undefined;
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone || whatsapp } : {}),
        ...(whatsapp !== undefined ? { whatsapp } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.marketingOptIn !== undefined
          ? { marketingOptIn: dto.marketingOptIn }
          : {}),
        ...(dto.birthDate !== undefined
          ? {
              birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
            }
          : {}),
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
   * Deduplica por telefone (variantes BR) e tolera webhook duplicado.
   */
  async upsertLeadFromWhatsapp(input: {
    companyId: string;
    whatsapp: string;
    name?: string | null;
    message?: string | null;
  }) {
    const whatsapp = normalizePhone(input.whatsapp);
    if (!whatsapp) return null;

    const candidates = phoneMatchCandidates(whatsapp);
    const last8 = whatsapp.slice(-8);

    const existing = await this.prisma.customer.findFirst({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        OR: [
          { whatsapp: { in: candidates } },
          { phone: { in: candidates } },
          ...(last8.length === 8
            ? [
                { whatsapp: { endsWith: last8 } },
                { phone: { endsWith: last8 } },
              ]
            : []),
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const message = input.message?.slice(0, 500) || null;
    const displayName =
      input.name?.trim() ||
      existing?.name ||
      `Lead ${whatsapp.slice(-4)}`;

    if (existing) {
      // Mesma mensagem em poucos segundos = webhook duplicado do provedor
      const recentDup =
        !!message &&
        message === existing.lastInboundMessage &&
        !!existing.lastInboundAt &&
        Date.now() - existing.lastInboundAt.getTime() < 30_000;

      if (recentDup) {
        return existing;
      }

      return this.prisma.customer.update({
        where: { id: existing.id },
        data: {
          name:
            existing.name.startsWith('Lead ') && input.name?.trim()
              ? input.name.trim()
              : existing.name,
          whatsapp: normalizePhone(existing.whatsapp) || whatsapp,
          phone: normalizePhone(existing.phone) || existing.phone || whatsapp,
          lastInboundAt: new Date(),
          lastInboundMessage: message || existing.lastInboundMessage,
          lifecycleStage: existing.lifecycleStage,
          source:
            existing.source === CustomerSource.MANUAL &&
            existing.lifecycleStage === CustomerLifecycle.LEAD
              ? CustomerSource.WHATSAPP
              : existing.source,
        },
      });
    }

    try {
      return await this.prisma.customer.create({
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
    } catch (error) {
      // Corrida entre dois webhooks: outro create ganhou — atualiza o existente
      const raced = await this.prisma.customer.findFirst({
        where: {
          companyId: input.companyId,
          deletedAt: null,
          OR: [
            { whatsapp: { in: candidates } },
            { phone: { in: candidates } },
            ...(last8.length === 8
              ? [{ whatsapp: { endsWith: last8 } }]
              : []),
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (raced) {
        return this.prisma.customer.update({
          where: { id: raced.id },
          data: {
            lastInboundAt: new Date(),
            lastInboundMessage: message || raced.lastInboundMessage,
            whatsapp: normalizePhone(raced.whatsapp) || whatsapp,
          },
        });
      }
      throw error;
    }
  }

  /**
   * Ao gerar agenda → vira CLIENTE automaticamente.
   */
  async promoteToCustomer(input: {
    companyId: string;
    customerId?: string;
    whatsapp?: string;
    name?: string;
    birthDate?: string;
    source?: CustomerSource;
  }) {
    const birthDate = input.birthDate ? new Date(input.birthDate) : undefined;
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
          birthDate,
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
          ...(birthDate && !customer.birthDate ? { birthDate } : {}),
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
        ...(birthDate && !customer.birthDate ? { birthDate } : {}),
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
    @Body() dto: UpdateCustomerDto,
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
