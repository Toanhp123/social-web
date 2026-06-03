import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { QueueOptions } from 'bullmq';
import { createBullMqRedisConnection } from '@/infrastructure/queue/bullmq-connection.factory.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): QueueOptions => ({
        connection: createBullMqRedisConnection(
          configService.getOrThrow<string>('redis.url'),
        ),
        prefix: configService.get<string>('queue.prefix') ?? 'social-web',
        defaultJobOptions: {
          attempts:
            configService.get<number>('queue.defaultJobOptions.attempts') ?? 3,
          backoff: {
            type: 'exponential',
            delay:
              configService.get<number>(
                'queue.defaultJobOptions.backoffDelayMs',
              ) ?? 5_000,
          },
          removeOnComplete:
            configService.get<number>(
              'queue.defaultJobOptions.removeOnComplete',
            ) ?? 1_000,
          removeOnFail:
            configService.get<number>('queue.defaultJobOptions.removeOnFail') ??
            5_000,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
