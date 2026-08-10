import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendTextInput,
  WhatsappConnectResult,
  WhatsappInstanceInitResult,
  WhatsappProvider,
  WhatsappStatusResult,
} from './whatsapp-provider';

/** Legacy / alternate provider kept for future swap. Prefer UazapiProvider. */
@Injectable()
export class EvolutionProvider implements WhatsappProvider {
  private readonly logger = new Logger(EvolutionProvider.name);

  constructor(private readonly config: ConfigService) {}

  async createInstance(name: string): Promise<WhatsappInstanceInitResult> {
    this.logger.warn('EvolutionProvider.createInstance não implementado no MVP');
    return { token: `evolution-mock-${name}`, name };
  }

  async connect(): Promise<WhatsappConnectResult> {
    return { status: 'disconnected', qrcode: null };
  }

  async disconnect(): Promise<void> {
    return;
  }

  async getStatus(): Promise<WhatsappStatusResult> {
    return { status: 'disconnected' };
  }

  async sendText(input: SendTextInput): Promise<void> {
    const url = this.config.get<string>('EVOLUTION_API_URL');
    if (!url) {
      this.logger.log(`Evolution não configurado; msg → ${input.to}: ${input.text}`);
      return;
    }
    const response = await fetch(
      `${url.replace(/\/$/, '')}/message/sendText/voltta`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.get<string>('EVOLUTION_API_KEY') || '',
        },
        body: JSON.stringify({ number: input.to, text: input.text }),
      },
    );
    if (!response.ok) throw new Error('Falha ao enviar via Evolution');
  }
}
