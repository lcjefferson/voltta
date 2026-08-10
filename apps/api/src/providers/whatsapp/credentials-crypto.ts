import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CredentialsCrypto {
  constructor(private readonly config: ConfigService) {}

  private key(): Buffer {
    const secret =
      this.config.get<string>('ENCRYPTION_KEY') ||
      '0123456789abcdef0123456789abcdef';
    return scryptSync(secret, 'voltta-whatsapp', 32);
  }

  encrypt(payload: object): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
    const json = Buffer.from(JSON.stringify(payload), 'utf8');
    const enc = Buffer.concat([cipher.update(json), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  }

  decrypt<T extends object>(blob: string): T {
    const buf = Buffer.from(blob, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(dec.toString('utf8')) as T;
  }
}
