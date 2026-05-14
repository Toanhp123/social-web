import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaTransactionContext {
  private readonly storage = new AsyncLocalStorage<Prisma.TransactionClient>();

  run<T>(tx: Prisma.TransactionClient, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(tx, fn);
  }

  getClient(): Prisma.TransactionClient | undefined {
    return this.storage.getStore();
  }
}
