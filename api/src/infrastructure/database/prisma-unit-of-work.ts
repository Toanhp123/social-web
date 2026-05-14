import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { PrismaTransactionContext } from './prisma-transaction-context.js';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.txContext.getClient()) {
      return fn();
    }

    return this.prisma.$transaction((tx) => this.txContext.run(tx, fn));
  }
}
