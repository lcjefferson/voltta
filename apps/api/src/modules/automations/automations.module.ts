import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Logger,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import {
  CompanyStatus,
  CustomerLifecycle,
  Prisma,
  RoleCode,
} from '@prisma/client';
import { WhatsappModule, WhatsappService } from '../whatsapp/whatsapp.module';

class CreateRuleDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(1)
  trigger!: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  trigger?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  actions?: object;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] || '');
}

function buildActions(template?: string, actions?: object) {
  if (actions) return actions;
  return [
    {
      type: 'whatsapp',
      template:
        template ||
        'Olá {{nome}}, seu horário é {{data}} às {{hora}}. {{link}}',
    },
  ];
}

function localCalendar(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value || 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    dateKey: `${String(get('year')).padStart(4, '0')}-${String(get('month')).padStart(2, '0')}-${String(get('day')).padStart(2, '0')}`,
  };
}

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);
  private birthdayRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsapp: WhatsappService,
  ) {}

  /** A cada hora: envia A5 às 08:00 no fuso da empresa. */
  @Cron(CronExpression.EVERY_HOUR)
  async handleBirthdayCron() {
    await this.runBirthdayCampaigns();
  }

  async runBirthdayCampaigns(opts?: { force?: boolean }) {
    if (this.birthdayRunning) {
      this.logger.warn('A5 birthday já em execução — pulando');
      return { processed: 0, sent: 0, failed: 0, skipped: 0 };
    }
    this.birthdayRunning = true;
    let processed = 0;
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    try {
      const companies = await this.prisma.company.findMany({
        where: {
          status: {
            in: [
              CompanyStatus.TRIALING,
              CompanyStatus.ACTIVE,
              CompanyStatus.PAST_DUE,
            ],
          },
          automationRules: {
            some: { trigger: 'A5', isActive: true },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          timezone: true,
          automationRules: {
            where: { trigger: 'A5', isActive: true },
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      });

      const now = new Date();
      for (const company of companies) {
        const tz = company.timezone || 'America/Sao_Paulo';
        const local = localCalendar(now, tz);
        if (!opts?.force && local.hour !== 8) continue;

        const rule = company.automationRules[0];
        if (!rule) continue;

        const birthdays = await this.prisma.customer.findMany({
          where: {
            companyId: company.id,
            deletedAt: null,
            lifecycleStage: CustomerLifecycle.CUSTOMER,
            marketingOptIn: true,
            birthDate: { not: null },
          },
        });

        const todayBirthdays = birthdays.filter((c) => {
          if (!c.birthDate) return false;
          return (
            c.birthDate.getUTCMonth() + 1 === local.month &&
            c.birthDate.getUTCDate() === local.day
          );
        });

        for (const customer of todayBirthdays) {
          processed += 1;
          const result = await this.sendBirthdayMessage({
            company: { id: company.id, slug: company.slug },
            rule: { id: rule.id, actions: rule.actions },
            customer,
            dateKey: local.dateKey,
          });
          if (result === 'sent') sent += 1;
          else if (result === 'failed') failed += 1;
          else skipped += 1;
        }
      }

      this.logger.log(
        `A5 birthday concluído — processados=${processed} enviados=${sent} falhas=${failed} pulados=${skipped}`,
      );
      return { processed, sent, failed, skipped };
    } catch (error) {
      this.logger.error(
        `Falha no A5 birthday: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    } finally {
      this.birthdayRunning = false;
    }
  }

  private async sendBirthdayMessage(input: {
    company: { id: string; slug: string };
    rule: { id: string; actions: Prisma.JsonValue };
    customer: {
      id: string;
      name: string;
      whatsapp: string | null;
      phone: string | null;
    };
    dateKey: string;
  }) {
    const webUrl = (process.env.WEB_URL || 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    const vars = {
      nome: input.customer.name,
      link: `${webUrl}/agendar/${input.company.slug}`,
      data: '',
      hora: '',
    };
    const actions = Array.isArray(input.rule.actions)
      ? (input.rule.actions as Array<{ type?: string; template?: string }>)
      : [];
    const template =
      actions[0]?.template ||
      'Olá {{nome}}\nFeliz aniversário! Que tal agendar um horário especial? {{link}}';
    const text = renderTemplate(template, vars);
    const to = input.customer.whatsapp || input.customer.phone || null;
    const key = `A5:${input.customer.id}:${input.dateKey}`;

    let executionId: string;
    try {
      const execution = await this.prisma.automationExecution.create({
        data: {
          companyId: input.company.id,
          ruleId: input.rule.id,
          customerId: input.customer.id,
          idempotencyKey: key,
          status: 'SCHEDULED',
          scheduledFor: new Date(),
          payload: { ...vars, text, to },
        },
      });
      executionId = execution.id;
    } catch {
      return 'duplicate';
    }

    const claimed = await this.prisma.automationExecution.updateMany({
      where: { id: executionId, status: 'SCHEDULED' },
      data: { status: 'RUNNING' },
    });
    if (!claimed.count) return 'skipped';

    if (!to) {
      await this.prisma.automationExecution.update({
        where: { id: executionId },
        data: {
          status: 'SKIPPED',
          executedAt: new Date(),
          errorMessage: 'sem_whatsapp',
        },
      });
      return 'skipped';
    }

    const result = await this.whatsapp.trySend(input.company.id, to, text);
    await this.prisma.automationExecution.update({
      where: { id: executionId },
      data: {
        status: result.sent ? 'SUCCEEDED' : 'FAILED',
        executedAt: new Date(),
        errorMessage: result.sent ? null : result.reason,
        payload: { ...vars, text, to, sendResult: result },
      },
    });
    return result.sent ? 'sent' : 'failed';
  }

  async scheduleForAppointmentCreated(appointmentId: string) {
    await this.schedule(appointmentId, 'A1', 0);
    await this.scheduleAppointmentReminders(appointmentId);
  }

  async scheduleAppointmentReminders(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment || appointment.status === 'CANCELED') return;

    const startsMs = appointment.startsAt.getTime();
    const now = Date.now();
    const delayA2 = startsMs - 24 * 3600_000 - now;
    const delayA3 = startsMs - 2 * 3600_000 - now;
    const version = appointment.startsAt.toISOString();

    if (delayA2 > 0) {
      await this.schedule(appointmentId, 'A2', delayA2, version);
    }
    if (delayA3 > 0) {
      await this.schedule(appointmentId, 'A3', delayA3, version);
    }
  }

  async rescheduleAppointmentReminders(appointmentId: string) {
    await this.skipPendingReminders(
      appointmentId,
      'reagendado — lembretes recalculados',
    );
    await this.scheduleAppointmentReminders(appointmentId);
  }

  async cancelAppointmentAutomations(appointmentId: string) {
    await this.skipPendingReminders(appointmentId, 'agendamento cancelado');
  }

  async scheduleReturnCampaign(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { services: true, customer: true },
    });
    if (!appointment) return;
    if (!appointment.customer.marketingOptIn) return;

    const intervalDays = appointment.services
      .map((s) => s.returnIntervalDays || 0)
      .filter((d) => d > 0)
      .reduce((max, d) => Math.max(max, d), 0);

    // Sem intervalo de retorno no serviço → A4 não agenda (PRD)
    if (!intervalDays) {
      this.logger.log(
        `A4 ignorada para ${appointmentId}: serviço sem returnIntervalDays`,
      );
      return;
    }

    await this.schedule(appointmentId, 'A4', intervalDays * 86400_000);
  }

  private async skipPendingReminders(appointmentId: string, reason: string) {
    await this.prisma.automationExecution.updateMany({
      where: {
        appointmentId,
        status: 'SCHEDULED',
        rule: { trigger: { in: ['A2', 'A3'] } },
      },
      data: {
        status: 'SKIPPED',
        executedAt: new Date(),
        errorMessage: reason,
      },
    });
  }

  private dueRunning = false;

  /** Processa execuções vencidas no banco (sobrevive a restart da API). */
  @Cron(CronExpression.EVERY_MINUTE)
  async processDueExecutions() {
    if (this.dueRunning) return;
    this.dueRunning = true;
    try {
      const due = await this.prisma.automationExecution.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: { lte: new Date() },
        },
        include: {
          rule: { select: { trigger: true } },
          appointment: { select: { id: true, status: true } },
          customer: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              phone: true,
              marketingOptIn: true,
            },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: 50,
      });

      for (const execution of due) {
        await this.executeDue(execution);
      }
    } finally {
      this.dueRunning = false;
    }
  }

  private async executeDue(execution: {
    id: string;
    companyId: string;
    customerId: string | null;
    payload: Prisma.JsonValue;
    rule: { trigger: string };
    appointment: { id: string; status: string } | null;
    customer: {
      id: string;
      name: string;
      whatsapp: string | null;
      phone: string | null;
      marketingOptIn: boolean;
    } | null;
  }) {
    const claimed = await this.prisma.automationExecution.updateMany({
      where: { id: execution.id, status: 'SCHEDULED' },
      data: { status: 'RUNNING' },
    });
    if (!claimed.count) return;

    const trigger = execution.rule.trigger;
    if (
      (trigger === 'A2' || trigger === 'A3') &&
      execution.appointment?.status === 'CANCELED'
    ) {
      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'SKIPPED',
          executedAt: new Date(),
          errorMessage: 'agendamento cancelado',
        },
      });
      return;
    }

    if (trigger === 'A4' && execution.customer && !execution.customer.marketingOptIn) {
      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'SKIPPED',
          executedAt: new Date(),
          errorMessage: 'marketing_opt_out',
        },
      });
      return;
    }

    const payload = (execution.payload || {}) as {
      text?: string;
      to?: string | null;
      nome?: string;
      data?: string;
      hora?: string;
      link?: string;
    };
    const text = payload.text || '';
    const to =
      payload.to ||
      execution.customer?.whatsapp ||
      execution.customer?.phone ||
      null;

    if (!text) {
      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          executedAt: new Date(),
          errorMessage: 'payload sem texto',
        },
      });
      return;
    }

    if (to) {
      const recent = await this.prisma.automationExecution.findMany({
        where: {
          companyId: execution.companyId,
          customerId: execution.customerId || undefined,
          status: 'SUCCEEDED',
          executedAt: { gte: new Date(Date.now() - 120_000) },
          id: { not: execution.id },
        },
        take: 10,
      });
      const duplicated = recent.some((item) => {
        const p = item.payload as { text?: string; to?: string } | null;
        return p?.text === text && p?.to === to;
      });
      if (duplicated) {
        await this.prisma.automationExecution.update({
          where: { id: execution.id },
          data: {
            status: 'SKIPPED',
            executedAt: new Date(),
            errorMessage: 'Mensagem idêntica já enviada recentemente',
          },
        });
        return;
      }
    }

    const result = await this.whatsapp.trySend(execution.companyId, to, text);
    await this.prisma.automationExecution.update({
      where: { id: execution.id },
      data: {
        status: result.sent ? 'SUCCEEDED' : 'FAILED',
        executedAt: new Date(),
        errorMessage: result.sent ? null : result.reason,
        payload: { ...payload, to, sendResult: result },
      },
    });
  }

  private async schedule(
    appointmentId: string,
    trigger: string,
    delayMs: number,
    keyVersion?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true, company: true },
    });
    if (!appointment) return;

    const rules = await this.prisma.automationRule.findMany({
      where: {
        companyId: appointment.companyId,
        trigger,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    const rule = rules[0];
    if (!rule) return;

    if (rules.length > 1) {
      await this.prisma.automationRule.updateMany({
        where: {
          id: { in: rules.slice(1).map((r) => r.id) },
        },
        data: { isActive: false },
      });
    }

    if (trigger === 'A4' && !appointment.customer.marketingOptIn) return;

    const webUrl = (process.env.WEB_URL || 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    const startsAt = appointment.startsAt;
    const vars = {
      nome: appointment.customer.name,
      data: startsAt.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      hora: startsAt.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
      }),
      link: `${webUrl}/agendar/${appointment.company.slug}`,
    };

    const actions = Array.isArray(rule.actions)
      ? (rule.actions as Array<{ type?: string; template?: string }>)
      : [];
    const defaultTemplates: Record<string, string> = {
      A1: 'Olá {{nome}}\nSeu horário está confirmado para {{data}} às {{hora}}.',
      A2: 'Olá {{nome}}\nLembrete: seu horário é amanhã, {{data}} às {{hora}}.',
      A3: 'Olá {{nome}}\nSeu horário é hoje às {{hora}}. Te esperamos!',
      A4: 'Olá {{nome}}\nEstá na hora de renovar seu visual.\nClique aqui: {{link}}',
    };
    const template =
      actions[0]?.template ||
      defaultTemplates[trigger] ||
      'Olá {{nome}}, seu horário é {{data}} às {{hora}}. {{link}}';
    const text = renderTemplate(template, vars);
    const key = keyVersion
      ? `${trigger}:${appointmentId}:${keyVersion}`
      : `${trigger}:${appointmentId}`;
    const to =
      appointment.customer.whatsapp || appointment.customer.phone || null;
    const scheduledFor = new Date(Date.now() + Math.max(0, delayMs));

    try {
      await this.prisma.automationExecution.create({
        data: {
          companyId: appointment.companyId,
          ruleId: rule.id,
          customerId: appointment.customerId,
          appointmentId,
          idempotencyKey: key,
          status: 'SCHEDULED',
          scheduledFor,
          payload: { ...vars, text, to, trigger },
        },
      });
    } catch {
      // Já agendada/enviada para este trigger+agendamento(+versão)
      return;
    }

    // Disparo imediato (A1 / A4 com delay 0) sem esperar o cron
    if (delayMs <= 0) {
      await this.processDueExecutions();
    }
  }

  list(companyId: string) {
    return this.prisma.automationRule.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async one(companyId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, companyId },
    });
    if (!rule) throw new NotFoundException('Automação não encontrada');
    return rule;
  }

  async create(companyId: string, dto: CreateRuleDto) {
    if (['A1', 'A2', 'A3', 'A4', 'A5'].includes(dto.trigger)) {
      const exists = await this.prisma.automationRule.findFirst({
        where: { companyId, trigger: dto.trigger, isActive: true },
      });
      if (exists) {
        throw new BadRequestException(
          `Já existe uma automação ativa para ${dto.trigger}. Edite a existente ou desative-a antes de criar outra.`,
        );
      }
    }

    return this.prisma.automationRule.create({
      data: {
        companyId,
        name: dto.name,
        trigger: dto.trigger,
        conditions: (dto.conditions || {}) as Prisma.InputJsonValue,
        actions: buildActions(dto.template) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async patch(companyId: string, id: string, dto: UpdateRuleDto) {
    const current = await this.one(companyId, id);

    const nextTrigger = dto.trigger ?? current.trigger;
    const nextActive = dto.isActive ?? current.isActive;
    if (
      nextActive &&
      ['A1', 'A2', 'A3', 'A4', 'A5'].includes(nextTrigger)
    ) {
      const conflict = await this.prisma.automationRule.findFirst({
        where: {
          companyId,
          trigger: nextTrigger,
          isActive: true,
          id: { not: id },
        },
      });
      if (conflict) {
        throw new BadRequestException(
          `Já existe outra automação ativa para ${nextTrigger}.`,
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.trigger !== undefined) data.trigger = dto.trigger;
    if (dto.conditions !== undefined) data.conditions = dto.conditions;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.actions !== undefined) data.actions = dto.actions;
    if (dto.template !== undefined) data.actions = buildActions(dto.template);

    if (!Object.keys(data).length) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    return this.prisma.automationRule.update({
      where: { id },
      data,
    });
  }

  async remove(companyId: string, id: string) {
    await this.one(companyId, id);
    await this.prisma.automationRule.delete({ where: { id } });
    return { message: 'Automação removida' };
  }

  executions(companyId: string) {
    return this.prisma.automationExecution.findMany({
      where: { companyId },
      include: {
        rule: { select: { id: true, name: true, trigger: true } },
        customer: { select: { id: true, name: true, whatsapp: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

@Controller('automations')
class AutomationsController {
  constructor(private readonly service: AutomationsService) {}

  @Get('rules')
  list(@CurrentUser() u: AuthUser) {
    return this.service.list(u.companyId);
  }

  @Get('rules/:id')
  one(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.one(u.companyId, id);
  }

  @Roles(RoleCode.ADMIN)
  @Post('rules')
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateRuleDto) {
    return this.service.create(u.companyId, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Patch('rules/:id')
  patch(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.service.patch(u.companyId, id, dto);
  }

  @Roles(RoleCode.ADMIN)
  @Delete('rules/:id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.service.remove(u.companyId, id);
  }

  @Get('executions')
  executions(@CurrentUser() u: AuthUser) {
    return this.service.executions(u.companyId);
  }

  /** Disparo manual da A5 (aniversariantes do dia no fuso da empresa). */
  @Roles(RoleCode.ADMIN)
  @Post('run-birthday')
  runBirthday() {
    return this.service.runBirthdayCampaigns({ force: true });
  }
}

@Module({
  imports: [PrismaModule, forwardRef(() => WhatsappModule)],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
