import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  private fromAddress() {
    return (
      this.config.get<string>('MAIL_FROM')?.trim() ||
      'VOLTTA <onboarding@resend.dev>'
    );
  }

  private async sendEmail(input: {
    to: string;
    subject: string;
    text: string;
    html: string;
    logContext: string;
  }): Promise<boolean> {
    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY ausente — e-mail não enviado (${input.logContext}) para ${input.to}`,
      );
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromAddress(),
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `Falha Resend (${response.status}) [${input.logContext}]: ${body}`,
      );
      return false;
    }

    this.logger.log(`E-mail enviado [${input.logContext}] → ${input.to}`);
    return true;
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<boolean> {
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
    return this.sendEmail({
      to,
      subject,
      text,
      html,
      logContext: 'password-reset',
    });
  }

  async sendTrialReminder(input: {
    to: string;
    companyName: string;
    daysLeft: number;
    billingUrl: string;
  }): Promise<boolean> {
    const { to, companyName, daysLeft, billingUrl } = input;
    const when =
      daysLeft <= 1
        ? 'amanhã'
        : `em ${daysLeft} dias`;
    const subject =
      daysLeft <= 1
        ? 'Seu trial VOLTTA termina amanhã'
        : `Seu trial VOLTTA termina em ${daysLeft} dias`;

    const text = [
      `Olá,`,
      '',
      `O período de avaliação da ${companyName} na VOLTTA termina ${when}.`,
      '',
      'Para continuar com agenda, WhatsApp e automações sem interrupção, ative seu plano:',
      billingUrl,
      '',
      '— Equipe VOLTTA',
    ].join('\n');

    const html = `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#1d1d1b">
        <p style="font-size:12px;letter-spacing:.2em;color:#9b7a44;font-weight:700">VOLTTA™</p>
        <h1 style="font-size:28px;margin:8px 0 16px">Trial terminando</h1>
        <p>O período de avaliação da <strong>${companyName}</strong> termina <strong>${when}</strong>.</p>
        <p>Ative o plano para manter agenda, WhatsApp e automações sem interrupção.</p>
        <p style="margin:28px 0">
          <a href="${billingUrl}" style="display:inline-block;background:#c4a574;color:#171715;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:6px">
            ATIVAR MEU PLANO
          </a>
        </p>
        <p style="font-size:13px;color:#666">Se já assinou, pode ignorar este e-mail.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      text,
      html,
      logContext: `trial-reminder-d${daysLeft}`,
    });
  }
}
