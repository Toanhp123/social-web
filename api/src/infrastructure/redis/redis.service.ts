import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis(configService.getOrThrow<string>('redis.url'), {
      lazyConnect: true,
      connectTimeout: 5_000,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 2,
      retryStrategy: (attempt) => {
        if (attempt > 3) {
          return null;
        }

        return Math.min(attempt * 100, 1_000);
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  getClient(): Redis {
    return this.client;
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
