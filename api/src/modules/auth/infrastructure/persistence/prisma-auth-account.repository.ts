import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { DatabaseTransaction } from '../../../../core/databases/unit-of-work.interface.js';
import { mapPrismaError } from '../../../../core/mappers/prisma-error.mapper.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import {
  AuthAccountRepository,
  RegisterAuthAccountInput,
} from '../../domain/repositories/auth-account.repository.interface.js';
import { AuthAccount } from '../../domain/entities/auth-account.entity.js';
import { AuthAccountMapper } from './mappers/auth-account.mapper.js';

@Injectable()
export class PrismaAuthAccountRepository implements AuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AuthAccount | null> {
    try {
      const account = await this.prisma.authAccount.findUnique({
        where: { id },
        select: this.selectAuthAccount(),
      });

      return account ? AuthAccountMapper.toDomain(account) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<AuthAccount | null> {
    try {
      const account = await this.prisma.authAccount.findUnique({
        where: { email },
        select: this.selectAuthAccount(),
      });

      return account ? AuthAccountMapper.toDomain(account) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async register(
    input: RegisterAuthAccountInput,
    tx: DatabaseTransaction,
  ): Promise<AuthAccount> {
    const client = tx as unknown as Prisma.TransactionClient;
    const accountId = randomUUID();

    try {
      const createdAccount = await client.authAccount.create({
        data: AuthAccountMapper.toPersistence(input, accountId),
      });

      await client.user.create({
        data: {
          id: accountId,
          fullName: input.fullName,
          username: input.username,
        },
      });

      return AuthAccountMapper.toDomain(createdAccount);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private selectAuthAccount() {
    return {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      emailVerifiedAt: true,
      passwordChangedAt: true,
      disabledAt: true,
    } as const;
  }
}
