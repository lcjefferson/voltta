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
      this.logger.warn(
        `STRIPE_SECRET_KEY ausente ou inválida (precisa começar com sk_; valor atual: ${
          key ? `${key.slice(0, 7)}…` : 'vazio'
        })`,
      );
      return null;
    }
    return new Stripe(key);
  }

  private priceId(): string | null {
    const price = this.config.get<string>('STRIPE_PRICE_ID')?.trim();
    if (!price || price.includes('replace') || !price.startsWith('price_')) {
      this.logger.warn(
        `STRIPE_PRICE_ID ausente ou inválido (precisa começar com price_; valor atual: ${
          price ? `${price.slice(0, 10)}…` : 'vazio'
        })`,
      );
      return null;
    }
    return price;
  }

  async checkout(
    companyId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string | null; error?: string }> {
    const stripe = this.client();
    const price = this.priceId();
    if (!stripe || !price) {
      const missing: string[] = [];
      if (!stripe) missing.push('STRIPE_SECRET_KEY (sk_...)');
      if (!price) missing.push('STRIPE_PRICE_ID (price_...)');
      return {
        url: null,
        error: `Stripe não configurado no container da API: ${missing.join(' e ')}. Salve no Coolify e faça Deploy/Restart.`,
      };
    }

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

    try {
      const configs = await stripe.billingPortal.configurations.list({
        limit: 1,
        active: true,
      });
      let configurationId = configs.data[0]?.id;

      if (!configurationId) {
        const created = await stripe.billingPortal.configurations.create({
          business_profile: {
            headline: 'Gerencie sua assinatura VOLTTA',
          },
          features: {
            customer_update: {
              enabled: true,
              allowed_updates: ['email', 'address', 'phone', 'tax_id'],
            },
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            subscription_cancel: {
              enabled: true,
              mode: 'at_period_end',
            },
            subscription_update: {
              enabled: false,
            },
          },
        });
        configurationId = created.id;
        this.logger.log(`Portal Stripe configurado: ${configurationId}`);
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
        configuration: configurationId,
      });
      return { url: session.url };
    } catch (error) {
      this.logger.error(
        `Falha ao abrir portal Stripe: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }
}
