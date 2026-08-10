export type WhatsappConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'hibernated'
  | 'error';

export type WhatsappInstanceInitResult = {
  instanceId?: string;
  token: string;
  name: string;
  status?: string;
};

export type WhatsappConnectResult = {
  status: WhatsappConnectionStatus;
  qrcode?: string | null;
  paircode?: string | null;
  profileName?: string | null;
};

export type WhatsappStatusResult = {
  status: WhatsappConnectionStatus;
  qrcode?: string | null;
  paircode?: string | null;
  profileName?: string | null;
  raw?: unknown;
};

export type SendTextInput = {
  to: string;
  text: string;
  instanceToken: string;
};

export type SetWebhookInput = {
  instanceToken: string;
  url: string;
  events?: string[];
};

/**
 * Port for WhatsApp providers (Uazapi, Evolution, Meta, Z-API).
 * Docs Uazapi: https://docs.uazapi.com/
 */
export interface WhatsappProvider {
  createInstance(name: string): Promise<WhatsappInstanceInitResult>;
  connect(instanceToken: string, phone?: string): Promise<WhatsappConnectResult>;
  disconnect(instanceToken: string): Promise<void>;
  getStatus(instanceToken: string): Promise<WhatsappStatusResult>;
  sendText(input: SendTextInput): Promise<void>;
  setWebhook?(input: SetWebhookInput): Promise<void>;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
