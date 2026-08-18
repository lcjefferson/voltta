import {
  Controller,
  Get,
  Injectable,
  Module,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsOptional } from 'class-validator';
import {
  CompanyStatus,
  Prisma,
  RoleCode,
  WhatsappConnectionStatus,
} from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PlatformAdminGuard } from '../../common/guards/auth.guards';
import {
  TENANT_BUCKETS,
  billingLabel,
  trialDaysLeft,
  type TenantBucket,
} from './platform-admin';

class TenantQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn([...TENANT_BUCKETS])
  bucket?: TenantBucket;
}

function bucketWhere(
  bucket: TenantBucket | undefined,
  now: Date,
): Prisma.CompanyWhereInput {
  const in3Days = new Date(now.getTime() + 3 * 86400000);
  switch (bucket) {
    case 'trialing':
      return { status: CompanyStatus.TRIALING, trialEndsAt: { gte: now } };
    case 'trial_expired':
      return { status: CompanyStatus.TRIALING, trialEndsAt: { lt: now } };
    case 'expiring_soon':
      return {
        status: CompanyStatus.TRIALING,
        trialEndsAt: { gte: now, lte: in3Days },
      };
    case 'active':
      return { status: CompanyStatus.ACTIVE };
    case 'past_due':
      return { status: CompanyStatus.PAST_DUE };
    case 'canceled':
      return { status: CompanyStatus.CANCELED };
    case 'suspended':
      return { status: CompanyStatus.SUSPENDED };
    default:
      return {};
  }
}

@Injectable()
class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 86400000);
    const [
      total,
      trialing,
      trialExpired,
      expiringSoon,
      active,
      pastDue,
      canceled,
      suspended,
      whatsappConnected,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({
        where: { status: CompanyStatus.TRIALING, trialEndsAt: { gte: now } },
      }),
      this.prisma.company.count({
        where: { status: CompanyStatus.TRIALING, trialEndsAt: { lt: now } },
      }),
      this.prisma.company.count({
        where: {
          status: CompanyStatus.TRIALING,
          trialEndsAt: { gte: now, lte: in3Days },
        },
      }),
      this.prisma.company.count({ where: { status: CompanyStatus.ACTIVE } }),
      this.prisma.company.count({ where: { status: CompanyStatus.PAST_DUE } }),
      this.prisma.company.count({ where: { status: CompanyStatus.CANCELED } }),
      this.prisma.company.count({
        where: { status: CompanyStatus.SUSPENDED },
      }),
      this.prisma.whatsappConnection.count({
        where: { status: WhatsappConnectionStatus.CONNECTED },
      }),
    ]);

    return {
      total,
      trialing,
      trialExpired,
      expiringSoon,
      active,
      pastDue,
      canceled,
      suspended,
      whatsappConnected,
    };
  }

  async tenants(query: TenantQueryDto) {
    const now = new Date();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const q = query.q?.trim();
    const where: Prisma.CompanyWhereInput = {
      AND: [
        bucketWhere(query.bucket, now),
        q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
                {
                  users: {
                    some: { email: { contains: q, mode: 'insensitive' } },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            where: { isActive: true },
            include: { role: true },
            orderBy: { createdAt: 'asc' },
          },
          subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
          whatsappConnections: { orderBy: { updatedAt: 'desc' }, take: 1 },
          _count: {
            select: {
              users: true,
              customers: { where: { deletedAt: null } },
              appointments: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: rows.map((company) => {
        const admin =
          company.users.find((user) => user.role.code === RoleCode.ADMIN) ||
          company.users[0] ||
          null;
        const subscription = company.subscriptions[0] || null;
        const whatsapp = company.whatsappConnections[0] || null;
        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          businessType: company.businessType,
          status: company.status,
          trialEndsAt: company.trialEndsAt,
          trialDaysLeft: trialDaysLeft(company.trialEndsAt, now),
          billingLabel: billingLabel(
            company.status,
            company.trialEndsAt,
            now,
          ),
          createdAt: company.createdAt,
          stripeCustomerId: company.stripeCustomerId,
          admin: admin
            ? { name: admin.name, email: admin.email }
            : null,
          subscriptionStatus: subscription?.status || null,
          currentPeriodEnd: subscription?.currentPeriodEnd || null,
          whatsappStatus: whatsapp?.status || null,
          whatsappConnected:
            whatsapp?.status === WhatsappConnectionStatus.CONNECTED,
          counts: company._count,
        };
      }),
      total,
      page,
      limit,
    };
  }
}

@Controller('platform')
@UseGuards(PlatformAdminGuard)
class PlatformController {
  constructor(private readonly service: PlatformService) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('tenants')
  tenants(@Query() query: TenantQueryDto) {
    return this.service.tenants(query);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
