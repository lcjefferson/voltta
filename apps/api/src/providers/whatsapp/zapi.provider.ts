import { WhatsappProvider } from './whatsapp-provider';

export class ZapiProvider implements WhatsappProvider {
  async createInstance(): Promise<never> {
    throw new Error('ZApiProvider ainda não configurado');
  }
  async connect(): Promise<never> {
    throw new Error('ZApiProvider ainda não configurado');
  }
  async disconnect(): Promise<void> {
    throw new Error('ZApiProvider ainda não configurado');
  }
  async getStatus(): Promise<never> {
    throw new Error('ZApiProvider ainda não configurado');
  }
  async sendText(): Promise<void> {
    throw new Error('ZApiProvider ainda não configurado');
  }
}
