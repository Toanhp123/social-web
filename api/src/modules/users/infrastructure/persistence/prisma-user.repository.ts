import { Injectable } from '@nestjs/common';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import {
  CreateUserInput,
  UserRepository,
} from '@/modules/users/domain/repositories/user.repository.interface.js';
import { UserMapper } from '@/modules/users/infrastructure/persistence/mappers/user.mapper.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(input: CreateUserInput): Promise<void> {
    const client = this.getClient();

    try {
      await client.user.create({
        data: input,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    const client = this.getClient();

    try {
      const user = await client.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          username: true,
          authAccount: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      });

      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
