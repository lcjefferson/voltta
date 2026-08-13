import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from '../../common/decorators/auth.decorators';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { QueuesModule } from '../../queues/queues.module';
import { RedisLockService } from '../../queues/redis-lock.service';
import {
  AUTOMATION_QUEUE,
  WHATSAPP_QUEUE,
  type RunExecutionJob,
  type SendWhatsappJob,
} from '../../queues/queue.constants';

type CheckStatus = 'ok' | 'fail';

@Injectable()
class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locks: RedisLockService,
    @InjectQueue(AUTOMATION_QUEUE)
    private readonly automationsQueue: Queue<RunExecutionJob>,
    @InjectQueue(WHATSAPP_QUEUE)
    private readonly whatsappQueue: Queue<SendWhatsappJob>,
  ) {}

  async checkDatabase(): Promise<{ status: CheckStatus; error?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async checkRedis(): Promise<{ status: CheckStatus; error?: string }> {
    try {
      const ok = await this.locks.ping();
      return ok
        ? { status: 'ok' }
        : { status: 'fail', error: 'ping sem PONG' };
    } catch (error) {
      return {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async queueCounts(queue: Queue) {
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'delayed',
      'failed',
      'completed',
    );
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      delayed: counts.delayed ?? 0,
      failed: counts.failed ?? 0,
      completed: counts.completed ?? 0,
    };
  }

  async queueMetrics() {
    try {
      const [automations, whatsapp] = await Promise.all([
        this.queueCounts(this.automationsQueue),
        this.queueCounts(this.whatsappQueue),
      ]);
      return {
        status: 'ok' as const,
        queues: {
          [AUTOMATION_QUEUE]: automations,
          [WHATSAPP_QUEUE]: whatsapp,
        },
      };
    } catch (error) {
      return {
        status: 'fail' as const,
        error: error instanceof Error ? error.message : String(error),
        queues: null,
      };
    }
  }

  async readiness() {
    const [database, redis, queues] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.queueMetrics(),
    ]);

    const ready = database.status === 'ok' && redis.status === 'ok';
    return {
      status: ready ? ('ready' as const) : ('not_ready' as const),
      checks: {
        database: database.status,
        redis: redis.status,
        queues: queues.status,
      },
      errors: {
        ...(database.error ? { database: database.error } : {}),
        ...(redis.error ? { redis: redis.error } : {}),
        ...(queues.error ? { queues: queues.error } : {}),
      },
      queues: queues.queues,
    };
  }
}

@Public()
@Controller()
class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  root() {
    return {
      name: 'VOLTTA API',
      slogan: 'Seu cliente sempre de volta.',
      status: 'ok',
      docs: '/docs',
      health: '/health',
      ready: '/ready',
      api: '/v1',
      web: process.env.WEB_URL || 'http://localhost:3000',
    };
  }

  /** Liveness: processo no ar (Coolify/Docker healthcheck). */
  @Get('health')
  liveness() {
    return { status: 'ok' };
  }

  /** Readiness: Postgres + Redis (filas). 503 se alguma dependência falhar. */
  @Get('ready')
  async ready() {
    const body = await this.service.readiness();
    if (body.status !== 'ready') {
      throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return body;
  }
}

@Module({
  imports: [PrismaModule, QueuesModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
