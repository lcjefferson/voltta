import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AUTOMATION_QUEUE, WHATSAPP_QUEUE } from './queue.constants';
import { redisConnectionFromUrl } from './redis.util';
import { RedisLockService } from './redis-lock.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: redisConnectionFromUrl(config.get<string>('REDIS_URL')),
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5_000,
          },
        },
      }),
    }),
    BullModule.registerQueue({ name: AUTOMATION_QUEUE }),
    BullModule.registerQueue({ name: WHATSAPP_QUEUE }),
  ],
  providers: [RedisLockService],
  exports: [BullModule, RedisLockService],
})
export class QueuesModule {}
