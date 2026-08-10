import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Query,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, CurrentUser } from '../../common/decorators/auth.decorators';

class RevenueDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

@Injectable()
class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string, from?: string, to?: string) {
    return this.prisma.revenue.findMany({
      where: {
        companyId,
        revenueDate: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
      },
      orderBy: [{ revenueDate: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  create(companyId: string, dto: RevenueDto) {
    return this.prisma.revenue.create({
      data: {
        companyId,
        amount: dto.amount,
        customerId: dto.customerId,
        serviceId: dto.serviceId,
        professionalId: dto.professionalId,
        paymentMethod: dto.paymentMethod || PaymentMethod.OTHER,
        revenueDate: new Date(),
      },
      include: {
        customer: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
    });
  }

  async summary(companyId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [monthAgg, yearAgg, allAgg, monthCount, byMethod, byService] =
      await Promise.all([
        this.prisma.revenue.aggregate({
          where: { companyId, revenueDate: { gte: monthStart } },
          _sum: { amount: true },
          _avg: { amount: true },
          _count: true,
        }),
        this.prisma.revenue.aggregate({
          where: { companyId, revenueDate: { gte: yearStart } },
          _sum: { amount: true },
        }),
        this.prisma.revenue.aggregate({
          where: { companyId },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.revenue.count({
          where: { companyId, revenueDate: { gte: monthStart } },
        }),
        this.prisma.revenue.groupBy({
          by: ['paymentMethod'],
          where: { companyId, revenueDate: { gte: monthStart } },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.revenue.groupBy({
          by: ['serviceId'],
          where: {
            companyId,
            revenueDate: { gte: monthStart },
            serviceId: { not: null },
          },
          _sum: { amount: true },
          _count: true,
          orderBy: { _sum: { amount: 'desc' } },
          take: 5,
        }),
      ]);

    const serviceIds = byService
      .map((s) => s.serviceId)
      .filter((id): id is string => !!id);
    const services = serviceIds.length
      ? await this.prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : [];
    const serviceName = new Map(services.map((s) => [s.id, s.name]));

    const monthRevenue = Number(monthAgg._sum.amount || 0);
    const avgTicket = Number(monthAgg._avg.amount || 0);

    // "Receita recorrente" aproximada: clientes com >1 visita no mês
    const recurringCustomers = await this.prisma.customer.count({
      where: {
        companyId,
        deletedAt: null,
        visitCount: { gt: 1 },
        lastVisitAt: { gte: monthStart },
      },
    });
    const recurringRevenue = await this.prisma.revenue.aggregate({
      where: {
        companyId,
        revenueDate: { gte: monthStart },
        customer: { visitCount: { gt: 1 } },
      },
      _sum: { amount: true },
    });

    return {
      monthRevenue,
      yearRevenue: Number(yearAgg._sum.amount || 0),
      totalRevenue: Number(allAgg._sum.amount || 0),
      avgTicket,
      monthTransactions: monthCount,
      recurringCustomers,
      recurringRevenue: Number(recurringRevenue._sum.amount || 0),
      byPaymentMethod: byMethod.map((r) => ({
        method: r.paymentMethod,
        amount: Number(r._sum.amount || 0),
        count: r._count,
      })),
      topServices: byService.map((s) => ({
        serviceId: s.serviceId,
        name: s.serviceId ? serviceName.get(s.serviceId) || 'Serviço' : 'Serviço',
        amount: Number(s._sum.amount || 0),
        count: s._count,
      })),
    };
  }
}

@Controller('revenues')
class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get()
  list(
    @CurrentUser() u: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.list(u.companyId, from, to);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: RevenueDto) {
    return this.service.create(u.companyId, dto);
  }

  @Get('summary')
  summary(@CurrentUser() u: AuthUser) {
    return this.service.summary(u.companyId);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
