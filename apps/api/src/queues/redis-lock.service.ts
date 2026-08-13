import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConnectionFromUrl } from './redis.util';

@Injectable()
export class RedisLockService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisLockService.name);
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis(
      redisConnectionFromUrl(config.get<string>('REDIS_URL')),
    );
    this.redis.on('error', (error) => {
      this.logger.error(
        `Redis lock error: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => undefined);
  }

  /** Tenta adquirir lock. Retorna true se este processo ficou com o lock. */
  async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(
      key,
      `${process.pid}:${Date.now()}`,
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  /**
   * Garante intervalo mínimo entre usos da mesma chave (ex.: envios WhatsApp por empresa).
   * Bloqueia o worker até o gap passar.
   */
  async throttle(key: string, minIntervalMs: number): Promise<void> {
    const now = Date.now();
    const lastRaw = await this.redis.get(key);
    if (lastRaw) {
      const wait = minIntervalMs - (now - Number(lastRaw));
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }
    await this.redis.set(key, String(Date.now()), 'PX', Math.max(minIntervalMs * 4, 60_000));
  }
}
