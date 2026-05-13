import type {
  DatabaseTransaction,
  UnitOfWork,
} from '@/core/databases/unit-of-work.interface.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  execute<T>(fn: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      fn(tx as unknown as DatabaseTransaction),
    );
  }
}
