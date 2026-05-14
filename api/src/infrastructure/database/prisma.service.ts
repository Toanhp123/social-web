import { PrismaClient } from '@/generated/prisma/client.js';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get('database.url')!,
    });
    const log: Array<'query' | 'error' | 'warn'> =
      configService.get('app.env') === 'development'
        ? ['query', 'error', 'warn']
        : ['error', 'warn'];

    super({ adapter, log });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
