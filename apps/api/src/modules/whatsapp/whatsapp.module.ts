import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Injectable,
  Logger,
  Module,
  Post,
  Query,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { RoleCode, WhatsappConnectionStatus } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthUser,
  CurrentUser,
  Public,
  Roles,
} from '../../common/decorators/auth.decorators';
import { WHATSAPP_PROVIDER } from '../../providers/whatsapp/whatsapp-provider';
import type { WhatsappProvider } from '../../providers/whatsapp/whatsapp-provider';
import { UazapiProvider } from '../../providers/whatsapp/uazapi.provider';
import { CredentialsCrypto } from '../../providers/whatsapp/credentials-crypto';
import {
  CustomersModule,
  CustomersService,
} from '../customers/customers.module';

type StoredCreds = {
  instanceToken: string;
  instanceId?: string;
  name: string;
};

class TestMessageDto {
  @IsString()
  @MinLength(8)
  to!: string;

  @IsString()
  @MinLength(1)
  text!: string;
}

class ConnectDto {
  @IsOptional()
  @IsString()
  phone?: string;
}

function toPrismaStatus(status: string): WhatsappConnectionStatus {
  switch (status) {
    case 'connected':
      return WhatsappConnectionStatus.CONNECTED;
    case 'connecting':
      return WhatsappConnectionStatus.CONNECTING;
    case 'hibernated':
    case 'disconnected':
      return WhatsappConnectionStatus.DISCONNECTED;
    default:
      return WhatsappConnectionStatus.ERROR;
  }
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
    private readonly crypto: CredentialsCrypto,
    private readonly customers: CustomersService,
    private readonly config: ConfigService,
  ) {}

  private async getRow(companyId: string) {
    return this.prisma.whatsappConnection.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private readCreds(row: { credentialsEncrypted: string | null }): StoredCreds {
    if (!row.credentialsEncrypted) {
      throw new BadRequestException('Instância WhatsApp sem credenciais');
    }
    return this.crypto.decrypt<StoredCreds>(row.credentialsEncrypted);
  }

  private webhookUrl(companyId: string) {
    const base = (
      this.config.get<string>('WEBHOOK_PUBLIC_URL') ||
      this.config.get<string>('API_URL') ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
    return `${base}/v1/whatsapp/webhooks/uazapi?companyId=${companyId}`;
  }

  private async registerWebhook(companyId: string, instanceToken: string) {
    if (!this.provider.setWebhook) return;
    const url = this.webhookUrl(companyId);
    try {
      await this.provider.setWebhook({
        instanceToken,
        url,
        events: ['messages', 'connection'],
      });
      this.logger.log(`Webhook Uazapi registrado: ${url}`);
    } catch (error) {
      this.logger.warn(
        `Falha ao registrar webhook Uazapi: ${
          error instanceof Error ? error.message : 'erro'
        }`,
      );
    }
  }

  async connection(companyId: string) {
    const row = await this.getRow(companyId);
    if (!row) {
      return {
        status: 'DISCONNECTED',
        provider: 'uazapi',
        connected: false,
        qrcode: null,
        paircode: null,
        profileName: null,
      };
    }

    let qrcode: string | null = null;
    let paircode: string | null = null;
    let profileName: string | null = null;
    let status = row.status;

    try {
      if (row.credentialsEncrypted) {
        const creds = this.readCreds(row);
        const remote = await this.provider.getStatus(creds.instanceToken);
        status = toPrismaStatus(remote.status);
        qrcode = remote.qrcode || null;
        paircode = remote.paircode || null;
        profileName = remote.profileName || null;
        await this.prisma.whatsappConnection.update({
          where: { id: row.id },
          data: { status, lastHealthcheckAt: new Date() },
        });
      }
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 401) {
        status = WhatsappConnectionStatus.DISCONNECTED;
        await this.prisma.whatsappConnection.update({
          where: { id: row.id },
          data: {
            status: WhatsappConnectionStatus.DISCONNECTED,
            credentialsEncrypted: null,
          },
        });
      } else {
        status = WhatsappConnectionStatus.ERROR;
      }
    }

    return {
      id: row.id,
      status,
      provider: row.provider,
      instanceName: row.instanceName,
      connected: status === WhatsappConnectionStatus.CONNECTED,
      qrcode,
      paircode,
      profileName,
      lastHealthcheckAt: row.lastHealthcheckAt,
      webhookUrl: this.webhookUrl(companyId),
    };
  }

  async createAndConnect(companyId: string, phone?: string) {
    try {
      return await this.createAndConnectInternal(companyId, phone);
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Falha ao conectar WhatsApp via Uazapi',
      );
    }
  }

  private async createAndConnectInternal(companyId: string, phone?: string) {
    const existing = await this.getRow(companyId);
    let creds: StoredCreds | null = null;
    let row = existing;
    let shouldCreateInstance = !existing?.credentialsEncrypted;

    if (existing?.credentialsEncrypted) {
      creds = this.readCreds(existing);
      try {
        const status = await this.provider.getStatus(creds.instanceToken);
        // sessão morta / inválida → nova instância
        if (status.status === 'disconnected' || status.status === 'error') {
          shouldCreateInstance = true;
        }
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (
          statusCode === 401 ||
          message.includes('invalid token') ||
          message.includes('not reconnectable')
        ) {
          this.logger.warn(
            `Token Uazapi inválido para company ${companyId}. Recriando instância.`,
          );
          shouldCreateInstance = true;
        } else {
          throw error;
        }
      }
    }

    if (shouldCreateInstance) {
      const name = `voltta-${companyId.slice(0, 8)}-${Date.now().toString(36)}`;
      const created = await this.provider.createInstance(name);
      creds = {
        instanceToken: created.token,
        instanceId: created.instanceId,
        name: created.name,
      };
      const encrypted = this.crypto.encrypt(creds);
      if (existing) {
        row = await this.prisma.whatsappConnection.update({
          where: { id: existing.id },
          data: {
            provider: 'uazapi',
            instanceName: created.name,
            credentialsEncrypted: encrypted,
            status: WhatsappConnectionStatus.CONNECTING,
          },
        });
      } else {
        row = await this.prisma.whatsappConnection.create({
          data: {
            companyId,
            provider: 'uazapi',
            instanceName: created.name,
            credentialsEncrypted: encrypted,
            status: WhatsappConnectionStatus.CONNECTING,
          },
        });
      }
    }

    if (!creds || !row) {
      throw new BadRequestException('Não foi possível preparar a instância WhatsApp');
    }

    const connected = await this.provider.connect(creds.instanceToken, phone);
    const status = toPrismaStatus(connected.status);
    await this.prisma.whatsappConnection.update({
      where: { id: row.id },
      data: { status, lastHealthcheckAt: new Date() },
    });

    await this.registerWebhook(companyId, creds.instanceToken);

    return {
      id: row.id,
      status,
      provider: 'uazapi',
      instanceName: creds.name,
      connected: status === WhatsappConnectionStatus.CONNECTED,
      qrcode: connected.qrcode || null,
      paircode: connected.paircode || null,
      profileName: connected.profileName || null,
      webhookUrl: this.webhookUrl(companyId),
    };
  }

  async qr(companyId: string) {
    try {
      const row = await this.getRow(companyId);
      if (!row?.credentialsEncrypted) {
        throw new BadRequestException('Conecte o WhatsApp primeiro');
      }
      const creds = this.readCreds(row);
      try {
        const remote = await this.provider.getStatus(creds.instanceToken);
        if (!remote.qrcode && remote.status !== 'connected') {
          const again = await this.provider.connect(creds.instanceToken);
          return {
            status: toPrismaStatus(again.status),
            qrcode: again.qrcode || null,
            paircode: again.paircode || null,
          };
        }
        return {
          status: toPrismaStatus(remote.status),
          qrcode: remote.qrcode || null,
          paircode: remote.paircode || null,
        };
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 401) {
          await this.prisma.whatsappConnection.update({
            where: { id: row.id },
            data: {
              status: WhatsappConnectionStatus.DISCONNECTED,
              credentialsEncrypted: null,
            },
          });
          throw new BadRequestException(
            'Sessão WhatsApp expirada. Clique em Conectar novamente.',
          );
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Falha ao obter QR Code',
      );
    }
  }

  async disconnect(companyId: string) {
    const row = await this.getRow(companyId);
    if (row?.credentialsEncrypted) {
      try {
        const creds = this.readCreds(row);
        await this.provider.disconnect(creds.instanceToken);
      } catch {
        /* ignore remote errors */
      }
    }
    await this.prisma.whatsappConnection.updateMany({
      where: { companyId },
      data: {
        status: WhatsappConnectionStatus.DISCONNECTED,
        credentialsEncrypted: null,
      },
    });
    return { message: 'WhatsApp desconectado' };
  }

  async sendForCompany(companyId: string, to: string, text: string) {
    const row = await this.getRow(companyId);
    if (!row?.credentialsEncrypted) {
      throw new BadRequestException('WhatsApp não conectado');
    }
    const creds = this.readCreds(row);
    try {
      await this.provider.sendText({
        to,
        text,
        instanceToken: creds.instanceToken,
      });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Falha ao enviar mensagem WhatsApp',
      );
    }
    return { message: 'Mensagem enviada' };
  }

  async test(companyId: string, dto: TestMessageDto) {
    return this.sendForCompany(companyId, dto.to, dto.text);
  }

  async trySend(companyId: string, to: string | null | undefined, text: string) {
    if (!to) return { sent: false, reason: 'sem_whatsapp' };
    try {
      await this.sendForCompany(companyId, to, text);
      return { sent: true };
    } catch (error) {
      return {
        sent: false,
        reason: error instanceof Error ? error.message : 'erro_envio',
      };
    }
  }

  /**
   * Webhook Uazapi: mensagem inbound → Lead.
   * Docs: https://docs.uazapi.com/
   */
  async handleUazapiWebhook(companyId: string | undefined, body: Record<string, unknown>) {
    if (!companyId) {
      return { received: true, ignored: 'missing_companyId' };
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) return { received: true, ignored: 'company_not_found' };

    const event = pickString(
      body.EventType,
      body.event,
      body.type,
      (body as { messageEvent?: string }).messageEvent,
    )?.toLowerCase();

    // connection events — refresh status
    if (event?.includes('connection') || body.status) {
      const statusRaw = pickString(body.status, (body.instance as { status?: string })?.status);
      if (statusRaw) {
        await this.prisma.whatsappConnection.updateMany({
          where: { companyId },
          data: {
            status: toPrismaStatus(statusRaw.toLowerCase()),
            lastHealthcheckAt: new Date(),
          },
        });
      }
    }

    const nested = (body.message || body.data || body.chat || body) as Record<
      string,
      unknown
    >;
    const fromMe =
      nested.fromMe === true ||
      nested.fromMe === 'true' ||
      body.fromMe === true ||
      pickString(nested.owner, nested.sender) === 'me';

    if (fromMe) {
      return { received: true, ignored: 'from_me' };
    }

    const chatId = pickString(
      nested.chatid,
      nested.chatId,
      nested.wa_chatid,
      nested.sender,
      nested.phone,
      nested.from,
      body.chatid,
      body.phone,
    );
    if (!chatId) {
      return { received: true, ignored: 'no_phone' };
    }

    // skip groups
    if (chatId.includes('@g.us') || nested.wa_isGroup === true) {
      return { received: true, ignored: 'group' };
    }

    const phone = chatId.replace(/@.*/, '');
    const name = pickString(
      nested.wa_contactName,
      nested.senderName,
      nested.pushName,
      nested.name,
      nested.lead_name,
      body.name,
    );
    const text = pickString(
      nested.text,
      nested.body,
      nested.content,
      nested.message,
      (nested.message as { conversation?: string })?.conversation,
      body.text,
    );

    const lead = await this.customers.upsertLeadFromWhatsapp({
      companyId,
      whatsapp: phone,
      name,
      message: text,
    });

    return {
      received: true,
      leadId: lead?.id,
      stage: lead?.lifecycleStage,
      event,
    };
  }
}

@Controller('whatsapp')
class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  @Get('connection')
  @Roles(RoleCode.ADMIN)
  get(@CurrentUser() u: AuthUser) {
    return this.service.connection(u.companyId);
  }

  @Post('connection')
  @Roles(RoleCode.ADMIN)
  create(@CurrentUser() u: AuthUser, @Body() dto: ConnectDto) {
    return this.service.createAndConnect(u.companyId, dto.phone);
  }

  @Delete('connection')
  @Roles(RoleCode.ADMIN)
  disconnect(@CurrentUser() u: AuthUser) {
    return this.service.disconnect(u.companyId);
  }

  @Get('connection/qr')
  @Roles(RoleCode.ADMIN)
  qr(@CurrentUser() u: AuthUser) {
    return this.service.qr(u.companyId);
  }

  @Post('test-message')
  @Roles(RoleCode.ADMIN)
  test(@CurrentUser() u: AuthUser, @Body() dto: TestMessageDto) {
    return this.service.test(u.companyId, dto);
  }

  @Post('test')
  @Roles(RoleCode.ADMIN)
  testAlias(@CurrentUser() u: AuthUser, @Body() dto: TestMessageDto) {
    return this.service.test(u.companyId, dto);
  }

  @Public()
  @Post('webhooks/uazapi')
  webhook(
    @Body() body: Record<string, unknown>,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.handleUazapiWebhook(companyId, body || {});
  }
}

@Module({
  imports: [PrismaModule, forwardRef(() => CustomersModule)],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    CredentialsCrypto,
    UazapiProvider,
    { provide: WHATSAPP_PROVIDER, useExisting: UazapiProvider },
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
