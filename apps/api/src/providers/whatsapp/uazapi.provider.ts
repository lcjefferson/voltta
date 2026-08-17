import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendTextInput,
  WhatsappConnectResult,
  WhatsappConnectionStatus,
  WhatsappInstanceInitResult,
  WhatsappProvider,
  WhatsappStatusResult,
} from './whatsapp-provider';

/**
 * UazapiGO v2 provider — https://docs.uazapi.com/
 *
 * Auth:
 * - admin endpoints: header `admintoken`
 * - instance endpoints: header `token`
 *
 * Core flow:
 * POST /instance/init → POST /instance/connect (QR) → POST /send/text
 */
@Injectable()
export class UazapiProvider implements WhatsappProvider {
  private readonly logger = new Logger(UazapiProvider.name);

  constructor(private readonly config: ConfigService) {}

  private baseUrl(): string {
    return (
      this.config.get<string>('UAZAPI_BASE_URL') ||
      'https://free.uazapi.com'
    ).replace(/\/$/, '');
  }

  private adminToken(): string {
    return this.config.get<string>('UAZAPI_ADMIN_TOKEN') || '';
  }

  private mapStatus(raw?: unknown): WhatsappConnectionStatus {
    let value = '';
    if (typeof raw === 'string') value = raw;
    else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const candidate = obj.status ?? obj.state ?? obj.connection ?? obj.name;
      value = typeof candidate === 'string' ? candidate : JSON.stringify(raw);
    } else if (raw != null) {
      value = String(raw);
    }
    value = value.toLowerCase();
    if (value.includes('connected') || value === 'open') return 'connected';
    if (value.includes('connecting') || value.includes('qr')) return 'connecting';
    if (value.includes('hibernat')) return 'hibernated';
    if (value.includes('disconnect') || value === 'close') return 'disconnected';
    return 'connecting';
  }

  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      token?: string;
      admin?: boolean;
    } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.admin) {
      const admin = this.adminToken();
      if (!admin) {
        throw new Error(
          'UAZAPI_ADMIN_TOKEN não configurado. Defina no .env da API.',
        );
      }
      headers.admintoken = admin;
    }
    if (options.token) headers.token = options.token;

    const response = await fetch(`${this.baseUrl()}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      this.logger.error(`Uazapi ${path} → ${response.status}: ${text}`);
      const message =
        (data as { message?: string })?.message ||
        `Uazapi falhou (${response.status}) em ${path}`;
      const error = new Error(message) as Error & { statusCode?: number };
      error.statusCode = response.status;
      throw error;
    }
    return data as T;
  }

  async createInstance(name: string): Promise<WhatsappInstanceInitResult> {
    const data = await this.request<{
      token?: string;
      id?: string;
      name?: string;
      status?: string;
      instance?: { token?: string; id?: string; name?: string; status?: string };
    }>('/instance/init', {
      method: 'POST',
      admin: true,
      body: { name },
    });

    const token = data.token || data.instance?.token;
    if (!token) {
      throw new Error('Uazapi não retornou token da instância');
    }

    return {
      token,
      instanceId: data.id || data.instance?.id,
      name: data.name || data.instance?.name || name,
      status: data.status || data.instance?.status,
    };
  }

  async connect(
    instanceToken: string,
    phone?: string,
  ): Promise<WhatsappConnectResult> {
    const data = await this.request<{
      status?: unknown;
      qrcode?: string;
      paircode?: string;
      profileName?: string;
      instance?: {
        status?: unknown;
        qrcode?: string;
        paircode?: string;
        profileName?: string;
      };
      response?: {
        status?: unknown;
        qrcode?: string;
        paircode?: string;
      };
    }>('/instance/connect', {
      method: 'POST',
      token: instanceToken,
      body: phone ? { phone } : {},
    });

    const statusRaw =
      data.status ?? data.instance?.status ?? data.response?.status;
    const qrcode =
      data.qrcode || data.instance?.qrcode || data.response?.qrcode || null;
    const paircode =
      data.paircode ||
      data.instance?.paircode ||
      data.response?.paircode ||
      null;

    return {
      status: this.mapStatus(statusRaw),
      qrcode: typeof qrcode === 'string' ? qrcode : null,
      paircode: typeof paircode === 'string' ? paircode : null,
      profileName: data.profileName || data.instance?.profileName || null,
    };
  }

  async disconnect(instanceToken: string): Promise<void> {
    await this.request('/instance/disconnect', {
      method: 'POST',
      token: instanceToken,
      body: {},
    });
  }

  async getStatus(instanceToken: string): Promise<WhatsappStatusResult> {
    const data = await this.request<{
      status?: unknown;
      qrcode?: string;
      paircode?: string;
      profileName?: string;
      instance?: {
        status?: unknown;
        qrcode?: string;
        paircode?: string;
        profileName?: string;
      };
      response?: {
        status?: unknown;
        qrcode?: string;
        paircode?: string;
      };
    }>('/instance/status', { token: instanceToken });

    const statusRaw =
      data.status ?? data.instance?.status ?? data.response?.status;

    return {
      status: this.mapStatus(statusRaw),
      qrcode:
        data.qrcode || data.instance?.qrcode || data.response?.qrcode || null,
      paircode:
        data.paircode ||
        data.instance?.paircode ||
        data.response?.paircode ||
        null,
      profileName: data.profileName || data.instance?.profileName || null,
      raw: data,
    };
  }

  async sendText(input: SendTextInput): Promise<void> {
    const number = input.to.replace(/\D/g, '');
    await this.request('/send/text', {
      method: 'POST',
      token: input.instanceToken,
      body: {
        number,
        text: input.text,
        linkPreview: true,
        readchat: true,
        delay: 0,
      },
    });
  }

  async setWebhook(input: {
    instanceToken: string;
    url: string;
    events?: string[];
  }): Promise<void> {
    const body = {
      enabled: true,
      url: input.url,
      events: input.events || ['messages', 'connection'],
      // Importante: NÃO anexar /messages na URL — quebra ?companyId= e gera 404.
      addUrlEvents: false,
      addUrlTypesMessages: false,
      excludeMessages: ['wasSentByApi', 'fromMeYes'],
      action: 'add',
    };
    // fortalabs/uazapiGO v2 usa POST /webhook (não /webhook/set)
    try {
      await this.request('/webhook', {
        method: 'POST',
        token: input.instanceToken,
        body,
      });
    } catch {
      await this.request('/webhook/set', {
        method: 'POST',
        token: input.instanceToken,
        body,
      });
    }
  }
}
