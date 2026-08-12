import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { CustomerSource } from '@prisma/client';
import { Public } from '../../common/decorators/auth.decorators';
import {
  buildSlots,
  listOpenDates,
  normalizeBusinessHours,
  wallClockToDate,
  weekdayInSaoPaulo,
} from '../../common/business-hours';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AppointmentsModule,
  AppointmentsService,
} from '../appointments/appointments.module';
import {
  CustomersModule,
  CustomersService,
  normalizePhone,
} from '../customers/customers.module';

class PublicAppointmentDto {
  @IsString()
  name!: string;
  @IsString()
  whatsapp!: string;
  @IsOptional()
  @IsDateString()
  birthDate?: string;
  @IsString()
  professionalId!: string;
  @IsDateString()
  startsAt!: string;
  @IsArray()
  @IsString({ each: true })
  serviceIds!: string[];
}

@Injectable()
class PublicBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointments: AppointmentsService,
    private readonly customers: CustomersService,
  ) {}

  async company(slug: string) {
    const c = await this.prisma.company.findFirst({
      where: { slug, status: { in: ['TRIALING', 'ACTIVE'] } },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        logoUrl: true,
        timezone: true,
        businessHours: true,
      },
    });
    if (!c) throw new BadRequestException('Empresa não encontrada');

    const businessHours = normalizeBusinessHours(c.businessHours);
    const openDates = listOpenDates(businessHours, new Date(), 21);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      phone: c.phone,
      logoUrl: c.logoUrl,
      timezone: c.timezone || 'America/Sao_Paulo',
      businessHours,
      openDates,
    };
  }

  async availability(
    slug: string,
    professionalId: string,
    serviceIds: string[],
    date: string,
  ) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Data inválida');
    }
    if (!professionalId) {
      throw new BadRequestException('Profissional obrigatório');
    }

    const company = await this.company(slug);
    const hours = company.businessHours;
    const weekday = weekdayInSaoPaulo(date);
    const day = hours.days[String(weekday)];
    if (!day) {
      return {
        date,
        durationMinutes: 0,
        open: false,
        slots: [] as { startsAt: string; label: string }[],
      };
    }

    const services = await this.prisma.service.findMany({
      where: {
        companyId: company.id,
        id: { in: serviceIds },
        isActive: true,
      },
    });
    if (!services.length || services.length !== serviceIds.length) {
      throw new BadRequestException('Serviços inválidos');
    }

    const durationMinutes = services.reduce(
      (s, x) => s + x.durationMinutes,
      0,
    );

    const dayStart = wallClockToDate(date, '00:00');
    const dayEnd = wallClockToDate(date, '23:59');
    const busy = await this.prisma.appointment.findMany({
      where: {
        companyId: company.id,
        professionalId,
        status: { not: 'CANCELED' },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: { startsAt: true, endsAt: true },
    });

    const slots = buildSlots({
      date,
      hours,
      durationMinutes,
      busy,
    });

    return {
      date,
      durationMinutes,
      open: true,
      dayHours: day,
      slots,
    };
  }

  async create(slug: string, dto: PublicAppointmentDto) {
    const company = await this.company(slug);
    const date = new Date(dto.startsAt)
      .toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

    const availability = await this.availability(
      slug,
      dto.professionalId,
      dto.serviceIds,
      date,
    );
    const ok = availability.slots.some((s) => s.startsAt === new Date(dto.startsAt).toISOString());
    // Compare by time proximity in case of ms formatting
    const okLoose = availability.slots.some(
      (s) => Math.abs(new Date(s.startsAt).getTime() - new Date(dto.startsAt).getTime()) < 1000,
    );
    if (!ok && !okLoose) {
      throw new BadRequestException('Horário indisponível');
    }

    const whatsapp = normalizePhone(dto.whatsapp) || dto.whatsapp;
    const customer = await this.customers.promoteToCustomer({
      companyId: company.id,
      whatsapp,
      name: dto.name,
      birthDate: dto.birthDate,
      source: CustomerSource.BOOKING,
    });
    return this.appointments.create(company.id, {
      customerId: customer.id,
      professionalId: dto.professionalId,
      startsAt: dto.startsAt,
      serviceIds: dto.serviceIds,
    });
  }
}

@Public()
@Controller('public')
class PublicBookingController {
  constructor(
    private readonly service: PublicBookingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':slug')
  company(@Param('slug') slug: string) {
    return this.service.company(slug);
  }

  @Get(':slug/services')
  async services(@Param('slug') slug: string) {
    const c = await this.service.company(slug);
    return this.prisma.service.findMany({
      where: { companyId: c.id, isActive: true },
    });
  }

  @Get(':slug/professionals')
  async pros(@Param('slug') slug: string) {
    const c = await this.service.company(slug);
    return this.prisma.user.findMany({
      where: { companyId: c.id, isActive: true, isProfessional: true },
      select: { id: true, name: true },
    });
  }

  @Get(':slug/availability')
  availability(
    @Param('slug') slug: string,
    @Query('professionalId') p: string,
    @Query('serviceIds') ids: string,
    @Query('date') date: string,
  ) {
    return this.service.availability(slug, p, ids?.split(',').filter(Boolean) || [], date);
  }

  @Post(':slug/appointments')
  create(@Param('slug') slug: string, @Body() dto: PublicAppointmentDto) {
    return this.service.create(slug, dto);
  }
}

@Module({
  imports: [PrismaModule, AppointmentsModule, CustomersModule],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
})
export class PublicBookingModule {}
