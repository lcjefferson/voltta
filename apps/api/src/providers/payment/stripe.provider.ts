import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentProvider } from './payment-provider';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly logger = new Logger(StripeProvider.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private client(): Stripe | null {
    const key = this.config.get<string>('STRIPE_SECRET_KEY')?.trim();
    if (!key || key.includes('replace') || !key.startsWith('sk_')) {
      this.logger.warn('STRIPE_SECRET_KEY ausente ou inválida');
      return null;
    }
    return new Stripe(key);
  }

  private priceId(): string | null {
    const price = this.config.get<string>('STRIPE_PRICE_ID')?.trim();
    if (!price || price.includes('replace') || !price.startsWith('price_')) {
      this.logger.warn('STRIPE_PRICE_ID ausente ou inválido');
      return null;
    }
    return price;
  }

  async checkout(
    companyId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string | null }> {
    const stripe = this.client();
    const price = this.priceId();
    if (!stripe || !price) return { url: null };

    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });

    let customerId = company.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: company.name,
        metadata: { companyId },
      });
      customerId = customer.id;
      await this.prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: companyId,
      metadata: { companyId },
      subscription_data: {
        metadata: { companyId },
      },
      allow_promotion_codes: true,
    });
    return { url: session.url };
  }

  async portal(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string | null }> {
    const stripe = this.client();
    if (!stripe) return { url: null };
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }
}
