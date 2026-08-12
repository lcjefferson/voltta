import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CompanyStatus, Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../providers/mail/mail.service';

const REMINDER_DAYS = [3, 1] as const;

@Injectable()
export class TrialRemindersService {
  private readonly logger = new Logger(TrialRemindersService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /** Todo dia às 13:00 UTC (~10:00 Brasília). */
  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async handleCron() {
    await this.runReminders();
  }

  async runReminders() {
    if (this.running) {
      this.logger.warn('Trial reminders já em execução — pulando');
      return;
    }
    this.running = true;
    try {
      let sent = 0;
      for (const daysLeft of REMINDER_DAYS) {
        sent += await this.sendForDaysLeft(daysLeft);
      }
      this.logger.log(`Trial reminders concluído — ${sent} e-mail(s) enviados`);
    } catch (error) {
      this.logger.error(
        `Falha nos trial reminders: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      this.running = false;
    }
  }

  private dayWindow(daysFromNow: number) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() + daysFromNow);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }

  private settingKey(daysLeft: number) {
    return `trial_reminder_d${daysLeft}`;
  }

  private async sendForDaysLeft(daysLeft: number) {
    const { start, end } = this.dayWindow(daysLeft);
    const companies = await this.prisma.company.findMany({
      where: {
        status: CompanyStatus.TRIALING,
        trialEndsAt: { gte: start, lt: end },
      },
      include: {
        users: {
          where: { isActive: true, role: { code: RoleCode.ADMIN } },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        settings: {
          where: { key: this.settingKey(daysLeft) },
          take: 1,
        },
      },
    });

    const webUrl = (
      this.config.get<string>('WEB_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
    const billingUrl = `${webUrl}/assinatura`;
    let sent = 0;

    for (const company of companies) {
      const admin = company.users[0];
      if (!admin?.email) {
        this.logger.warn(
          `Company ${company.id} sem ADMIN ativo para reminder D-${daysLeft}`,
        );
        continue;
      }

      const existing = company.settings[0];
      const alreadySentForThisTrial =
        existing &&
        typeof existing.value === 'object' &&
        existing.value !== null &&
        'trialEndsAt' in existing.value &&
        String((existing.value as { trialEndsAt?: string }).trialEndsAt) ===
          company.trialEndsAt.toISOString();

      if (alreadySentForThisTrial) continue;

      const ok = await this.mail.sendTrialReminder({
        to: admin.email,
        companyName: company.name,
        daysLeft,
        billingUrl,
      });

      if (!ok) continue;

      await this.prisma.setting.upsert({
        where: {
          companyId_key: {
            companyId: company.id,
            key: this.settingKey(daysLeft),
          },
        },
        create: {
          companyId: company.id,
          key: this.settingKey(daysLeft),
          value: {
            sentAt: new Date().toISOString(),
            trialEndsAt: company.trialEndsAt.toISOString(),
            daysLeft,
            to: admin.email,
          } as Prisma.InputJsonValue,
        },
        update: {
          value: {
            sentAt: new Date().toISOString(),
            trialEndsAt: company.trialEndsAt.toISOString(),
            daysLeft,
            to: admin.email,
          } as Prisma.InputJsonValue,
        },
      });
      sent += 1;
    }

    return sent;
  }
}
