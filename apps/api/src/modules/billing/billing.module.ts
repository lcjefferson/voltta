import {
  Body,
  Controller,
  Get,
  Headers,
  Injectable,
  Module,
  Post,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { IsString } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthUser,
  CurrentUser,
  Public,
  Roles,
} from '../../common/decorators/auth.decorators';
import { RoleCode } from '@prisma/client';
import { StripeProvider } from '../../providers/payment/stripe.provider';
import Stripe from 'stripe';

class UrlDto {
  @IsString()
  successUrl!: string;
  @IsString()
  cancelUrl!: string;
}
class PortalDto {
  @IsString()
  returnUrl!: string;
}

@Injectable()
class BillingService {
  private stripe?: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeProvider: StripeProvider,
    private readonly config: ConfigService,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    if (key && !key.includes('replace')) this.stripe = new Stripe(key);
  }

  checkout(companyId: string, dto: UrlDto) {
    return this.stripeProvider.checkout(
      companyId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  async portal(companyId: string, dto: PortalDto) {
    const c = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });
    if (!c.stripeCustomerId) {
      throw new BadRequestException('Cliente Stripe não encontrado');
    }
    return this.stripeProvider.portal(c.stripeCustomerId, dto.returnUrl);
  }

  subscription(companyId: string) {
    return this.prisma.subscription.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    if (this.stripe && secret && !secret.includes('replace') && signature) {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } else {
      event = JSON.parse(rawBody.toString('utf8')) as Stripe.Event;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId =
          session.client_reference_id || session.metadata?.companyId;
        if (!companyId) break;
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            status: 'ACTIVE',
            stripeCustomerId:
              typeof session.customer === 'string'
                ? session.customer
                : undefined,
          },
        });
        if (typeof session.subscription === 'string') {
          await this.prisma.subscription.upsert({
            where: { stripeSubscriptionId: session.subscription },
            create: {
              companyId,
              stripeCustomerId:
                typeof session.customer === 'string' ? session.customer : '',
              stripeSubscriptionId: session.subscription,
              status: 'ACTIVE',
            },
            update: { status: 'ACTIVE' },
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = sub.metadata?.companyId;
        if (!companyId) break;
        const status =
          sub.status === 'active'
            ? 'ACTIVE'
            : sub.status === 'past_due'
              ? 'PAST_DUE'
              : sub.status === 'canceled'
                ? 'CANCELED'
                : 'TRIALING';
        await this.prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          create: {
            companyId,
            stripeCustomerId: String(sub.customer),
            stripeSubscriptionId: sub.id,
            status: status as 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING',
            currentPeriodEnd: new Date(
              ((sub as unknown as { current_period_end?: number })
                .current_period_end || 0) * 1000,
            ),
          },
          update: {
            status: status as 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING',
          },
        });
        await this.prisma.company.update({
          where: { id: companyId },
          data: {
            status:
              status === 'ACTIVE'
                ? 'ACTIVE'
                : status === 'PAST_DUE'
                  ? 'PAST_DUE'
                  : status === 'CANCELED'
                    ? 'CANCELED'
                    : undefined,
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'CANCELED' },
        });
        const companyId = sub.metadata?.companyId;
        if (companyId) {
          await this.prisma.company.update({
            where: { id: companyId },
            data: { status: 'CANCELED' },
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : null;
        if (!customerId) break;
        const company = await this.prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (!company) break;
        const grace = new Date(Date.now() + 7 * 86400000);
        await this.prisma.company.update({
          where: { id: company.id },
          data: { status: 'PAST_DUE' },
        });
        await this.prisma.subscription.updateMany({
          where: { companyId: company.id },
          data: { status: 'PAST_DUE', graceUntil: grace },
        });
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}

@Controller('billing')
class BillingController {
  constructor(private readonly service: BillingService) {}

  @Roles(RoleCode.ADMIN)
  @Post('checkout-session')
  checkout(@CurrentUser() u: AuthUser, @Body() dto: UrlDto) {
    return this.service.checkout(u.companyId, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Post('portal-session')
  portal(@CurrentUser() u: AuthUser, @Body() dto: PortalDto) {
    return this.service.portal(u.companyId, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Get('subscription')
  subscription(@CurrentUser() u: AuthUser) {
    return this.service.subscription(u.companyId);
  }

  @Public()
  @Post('webhooks/stripe')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw =
      (req as RawBodyRequest<Request>).rawBody ||
      Buffer.from(JSON.stringify(req.body || {}));
    return this.service.handleWebhook(raw, signature || '');
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, StripeProvider],
})
export class BillingModule {}
