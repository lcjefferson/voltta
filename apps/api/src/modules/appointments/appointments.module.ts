import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../../common/decorators/auth.decorators';
import {
  AutomationsModule,
  AutomationsService,
} from '../automations/automations.module';
import { ScoresModule, ScoresService } from '../scores/scores.module';

class CreateAppointmentDto {
  @IsString()
  customerId!: string;
  @IsString()
  professionalId!: string;
  @IsDateString()
  startsAt!: string;
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  serviceIds!: string[];
  @IsOptional()
  @IsString()
  notes?: string;
}

class RescheduleDto {
  @IsDateString()
  startsAt!: string;
}

class ChangeCustomerDto {
  @IsString()
  customerId!: string;
}

class ListDto {
  @IsOptional()
  @IsDateString()
  from?: string;
  @IsOptional()
  @IsDateString()
  to?: string;
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
  @IsOptional()
  @IsString()
  professionalId?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automations: AutomationsService,
    private readonly scores: ScoresService,
  ) {}

  private async promoteCustomer(customerId: string) {
    await this.prisma.customer.updateMany({
      where: { id: customerId, lifecycleStage: { not: 'CUSTOMER' } },
      data: { lifecycleStage: 'CUSTOMER', convertedAt: new Date() },
    });
  }

  async create(companyId: string, dto: CreateAppointmentDto) {
    const [customer, professional, services] = await Promise.all([
      this.prisma.customer.findFirst({
        where: { id: dto.customerId, companyId, deletedAt: null },
      }),
      this.prisma.user.findFirst({
        where: {
          id: dto.professionalId,
          companyId,
          isActive: true,
          isProfessional: true,
        },
      }),
      this.prisma.service.findMany({
        where: { id: { in: dto.serviceIds }, companyId, isActive: true },
      }),
    ]);

    if (!customer || !professional || services.length !== dto.serviceIds.length) {
      throw new BadRequestException(
        'Cliente, profissional ou serviços inválidos',
      );
    }

    await this.promoteCustomer(customer.id);

    const startsAt = new Date(dto.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Data inválida');
    }

    const duration = services.reduce((x, s) => x + s.durationMinutes, 0);
    const endsAt = new Date(startsAt.getTime() + duration * 60000);
    const overlap = await this.prisma.appointment.findFirst({
      where: {
        companyId,
        professionalId: dto.professionalId,
        status: { not: 'CANCELED' },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });
    if (overlap) {
      throw new BadRequestException(
        'Profissional já possui atendimento neste horário',
      );
    }

    const totalAmount = services.reduce((x, s) => x + Number(s.price), 0);
    const appointment = await this.prisma.appointment.create({
      data: {
        companyId,
        customerId: customer.id,
        professionalId: professional.id,
        startsAt,
        endsAt,
        totalAmount,
        notes: dto.notes,
        services: {
          create: services.map((s) => ({
            companyId,
            serviceId: s.id,
            price: s.price,
            durationMinutes: s.durationMinutes,
            returnIntervalDays: s.returnIntervalDays,
          })),
        },
      },
      include: {
        services: { include: { service: true } },
        customer: true,
        professional: { select: { id: true, name: true } },
      },
    });

    await this.automations.scheduleForAppointmentCreated(appointment.id);
    return appointment;
  }

  list(companyId: string, q: ListDto) {
    return this.prisma.appointment.findMany({
      where: {
        companyId,
        ...(q.status ? { status: q.status } : {}),
        ...(q.professionalId ? { professionalId: q.professionalId } : {}),
        startsAt: {
          ...(q.from ? { gte: new Date(q.from) } : {}),
          ...(q.to ? { lte: new Date(q.to) } : {}),
        },
      },
      include: {
        customer: true,
        professional: { select: { id: true, name: true } },
        services: { include: { service: true } },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async reschedule(companyId: string, id: string, dto: RescheduleDto) {
    const old = await this.prisma.appointment.findFirst({
      where: { id, companyId },
      include: { services: true },
    });
    if (!old || old.status === 'CANCELED' || old.status === 'COMPLETED') {
      throw new BadRequestException('Agendamento inválido');
    }

    const start = new Date(dto.startsAt);
    const end = new Date(
      start.getTime() +
        old.services.reduce((n, s) => n + s.durationMinutes, 0) * 60000,
    );
    const overlap = await this.prisma.appointment.findFirst({
      where: {
        companyId,
        professionalId: old.professionalId,
        id: { not: id },
        status: { not: 'CANCELED' },
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });
    if (overlap) {
      throw new BadRequestException(
        'Profissional já possui atendimento neste horário',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { startsAt: start, endsAt: end },
      include: {
        customer: true,
        professional: { select: { id: true, name: true } },
        services: { include: { service: true } },
      },
    });
  }

  async changeCustomer(companyId: string, id: string, dto: ChangeCustomerDto) {
    const app = await this.prisma.appointment.findFirst({
      where: { id, companyId },
    });
    if (!app || app.status === 'CANCELED' || app.status === 'COMPLETED') {
      throw new BadRequestException('Agendamento inválido para troca de cliente');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new BadRequestException('Cliente inválido');

    await this.promoteCustomer(customer.id);

    return this.prisma.appointment.update({
      where: { id },
      data: { customerId: customer.id },
      include: {
        customer: true,
        professional: { select: { id: true, name: true } },
        services: { include: { service: true } },
      },
    });
  }

  async status(companyId: string, id: string, status: AppointmentStatus) {
    const app = await this.prisma.appointment.findFirst({
      where: { id, companyId },
      include: { services: true },
    });
    if (!app) throw new BadRequestException('Agendamento não encontrado');

    if (status === 'CANCELED') {
      if (app.status === 'COMPLETED') {
        throw new BadRequestException(
          'Não é possível cancelar um atendimento já finalizado',
        );
      }
      if (app.status === 'CANCELED') {
        return { message: 'Agendamento já estava cancelado' };
      }
      await this.prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELED' },
      });
      return { message: 'Agendamento cancelado' };
    }

    if (status === 'COMPLETED' && app.status !== 'COMPLETED') {
      if (app.status === 'CANCELED') {
        throw new BadRequestException(
          'Não é possível finalizar um agendamento cancelado',
        );
      }

      // Financeiro automático: 1 lançamento por serviço com o valor do serviço
      await this.prisma.$transaction([
        this.prisma.appointment.update({
          where: { id },
          data: { status: 'COMPLETED' },
        }),
        ...app.services.map((s) =>
          this.prisma.revenue.create({
            data: {
              companyId,
              customerId: app.customerId,
              appointmentId: id,
              professionalId: app.professionalId,
              serviceId: s.serviceId,
              amount: s.price,
              paymentMethod: 'OTHER',
              revenueDate: new Date(),
            },
          }),
        ),
      ]);

      const spent = Number(app.totalAmount);
      const c = await this.prisma.customer.update({
        where: { id: app.customerId },
        data: {
          totalSpent: { increment: spent },
          lifetimeValue: { increment: spent },
          visitCount: { increment: 1 },
          lastVisitAt: new Date(),
          nextReturnAt: app.services[0]?.returnIntervalDays
            ? new Date(
                Date.now() + app.services[0].returnIntervalDays * 86400000,
              )
            : undefined,
        },
      });
      await this.prisma.customer.update({
        where: { id: c.id },
        data: {
          avgTicket: Number(c.totalSpent) / Math.max(c.visitCount, 1),
        },
      });
      await this.scores.recalculateCustomer(companyId, app.customerId);
      await this.automations.scheduleReturnCampaign(id);
      return {
        message: 'Atendimento finalizado e receita lançada no financeiro',
        revenueAmount: spent,
      };
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }
}

@Controller('appointments')
class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query() q: ListDto) {
    return this.service.list(u.companyId, q);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateAppointmentDto) {
    return this.service.create(u.companyId, dto);
  }

  @Patch(':id/reschedule')
  move(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: RescheduleDto,
  ) {
    return this.service.reschedule(u.companyId, id, dto);
  }

  @Patch(':id/customer')
  changeCustomer(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ChangeCustomerDto,
  ) {
    return this.service.changeCustomer(u.companyId, id, dto);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.status(u.companyId, id, 'CANCELED');
  }

  @Patch(':id/complete')
  complete(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.status(u.companyId, id, 'COMPLETED');
  }
}

@Module({
  imports: [PrismaModule, AutomationsModule, ScoresModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
