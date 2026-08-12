import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendPasswordReset(to: string, resetUrl: string): Promise<boolean> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    const from =
      this.config.get<string>('MAIL_FROM')?.trim() ||
      'VOLTTA <onboarding@resend.dev>';

    const subject = 'Redefinir sua senha — VOLTTA';
    const text = [
      'Olá,',
      '',
      'Recebemos um pedido para redefinir a senha da sua conta VOLTTA.',
      'Abra o link abaixo (válido por 1 hora):',
      '',
      resetUrl,
      '',
      'Se você não solicitou, ignore este e-mail.',
      '',
      '— Equipe VOLTTA',
    ].join('\n');
    const html = `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#1d1d1b">
        <p style="font-size:12px;letter-spacing:.2em;color:#9b7a44;font-weight:700">VOLTTA™</p>
        <h1 style="font-size:28px;margin:8px 0 16px">Redefinir senha</h1>
        <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#c4a574;color:#171715;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:6px">
            ESCOLHER NOVA SENHA
          </a>
        </p>
        <p style="font-size:13px;color:#666">O link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
        <p style="font-size:12px;color:#999;word-break:break-all">${resetUrl}</p>
      </div>
    `;

    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY ausente — e-mail não enviado. Link de reset: ${resetUrl}`,
      );
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `Falha ao enviar e-mail via Resend (${response.status}): ${body}`,
      );
      this.logger.warn(`Link de reset (fallback log): ${resetUrl}`);
      return false;
    }

    this.logger.log(`E-mail de reset enviado para ${to}`);
    return true;
  }
}
