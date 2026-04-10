import { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(async (tx) => {
      return fn(tx);
    });
  }
}
