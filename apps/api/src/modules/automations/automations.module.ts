import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  forwardRef,
  Inject,
} from '@nestjs/common';
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
import { Prisma, RoleCode } from '@prisma/client';
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

@Injectable()
export class AutomationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsapp: WhatsappService,
  ) {}

  async scheduleForAppointmentCreated(appointmentId: string) {
    return this.schedule(appointmentId, 'A1', 0);
  }

  async scheduleReturnCampaign(appointmentId: string) {
    return this.schedule(appointmentId, 'A4', 0);
  }

  async scheduleReminder(
    appointmentId: string,
    trigger: 'A2' | 'A3',
    delayMs: number,
  ) {
    return this.schedule(appointmentId, trigger, delayMs);
  }

  private async schedule(
    appointmentId: string,
    trigger: string,
    delayMs: number,
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

    // Evita 2x a mesma automação se existirem regras duplicadas ativas
    if (rules.length > 1) {
      await this.prisma.automationRule.updateMany({
        where: {
          id: { in: rules.slice(1).map((r) => r.id) },
        },
        data: { isActive: false },
      });
    }

    if (trigger === 'A4' && !appointment.customer.marketingOptIn) return;

    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    const vars = {
      nome: appointment.customer.name,
      data: appointment.startsAt.toLocaleDateString('pt-BR'),
      hora: appointment.startsAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      link: `${webUrl}/agendar/${appointment.company.slug}`,
    };

    const actions = Array.isArray(rule.actions)
      ? (rule.actions as Array<{ type?: string; template?: string }>)
      : [];
    const template =
      actions[0]?.template ||
      'Olá {{nome}}, seu horário é {{data}} às {{hora}}. {{link}}';
    const text = renderTemplate(template, vars);
    // Uma execução por trigger + agendamento (não por ruleId)
    const key = `${trigger}:${appointmentId}`;
    const to =
      appointment.customer.whatsapp || appointment.customer.phone || null;

    let executionId: string;
    try {
      const execution = await this.prisma.automationExecution.create({
        data: {
          companyId: appointment.companyId,
          ruleId: rule.id,
          customerId: appointment.customerId,
          appointmentId,
          idempotencyKey: key,
          status: 'SCHEDULED',
          scheduledFor: new Date(Date.now() + delayMs),
          payload: { ...vars, text, to },
        },
      });
      executionId = execution.id;
    } catch {
      // Já agendada/enviada para este trigger+agendamento
      return;
    }

    const run = async () => {
      // Claim atômico: só um worker envia
      const claimed = await this.prisma.automationExecution.updateMany({
        where: { id: executionId, status: 'SCHEDULED' },
        data: { status: 'RUNNING' },
      });
      if (!claimed.count) return;

      // Proteção extra: mesmo destino + mesmo texto nos últimos 2 min
      if (to) {
        const recent = await this.prisma.automationExecution.findMany({
          where: {
            companyId: appointment.companyId,
            customerId: appointment.customerId,
            status: 'SUCCEEDED',
            executedAt: { gte: new Date(Date.now() - 120_000) },
            id: { not: executionId },
          },
          take: 10,
        });
        const duplicated = recent.some((item) => {
          const payload = item.payload as { text?: string; to?: string } | null;
          return payload?.text === text && payload?.to === to;
        });
        if (duplicated) {
          await this.prisma.automationExecution.update({
            where: { id: executionId },
            data: {
              status: 'SKIPPED',
              executedAt: new Date(),
              errorMessage: 'Mensagem idêntica já enviada recentemente',
            },
          });
          return;
        }
      }

      const result = await this.whatsapp.trySend(
        appointment.companyId,
        to,
        text,
      );
      await this.prisma.automationExecution.update({
        where: { id: executionId },
        data: {
          status: result.sent ? 'SUCCEEDED' : 'FAILED',
          executedAt: new Date(),
          errorMessage: result.sent ? null : result.reason,
          payload: { ...vars, text, to, sendResult: result },
        },
      });
    };

    if (delayMs <= 0) void run();
    else setTimeout(() => void run(), delayMs);
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
}

@Module({
  imports: [PrismaModule, forwardRef(() => WhatsappModule)],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
