import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import {
  AuthAccountRepository,
  LinkOAuthAccountInput,
  OAuthAccountLookupInput,
  RegisterAuthAccountInput,
} from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { AuthAccountMapper } from '@/modules/auth/infrastructure/persistence/mappers/auth-account.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaAuthAccountRepository implements AuthAccountRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async findById(id: string): Promise<AuthAccount | null> {
    const client = this.getClient();

    try {
      const account = await client.authAccount.findUnique({
        where: { id },
        select: AuthAccountMapper.select,
      });

      return account ? AuthAccountMapper.toDomain(account) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<AuthAccount | null> {
    const client = this.getClient();

    try {
      const account = await client.authAccount.findUnique({
        where: { email },
        select: AuthAccountMapper.select,
      });

      return account ? AuthAccountMapper.toDomain(account) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByOAuthAccount(
    input: OAuthAccountLookupInput,
  ): Promise<AuthAccount | null> {
    const client = this.getClient();

    try {
      const oauthAccount = await client.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider: input.provider,
            providerId: input.providerId,
          },
        },
        select: {
          authAccount: {
            select: AuthAccountMapper.select,
          },
        },
      });

      return oauthAccount
        ? AuthAccountMapper.toDomain(oauthAccount.authAccount)
        : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async register(input: RegisterAuthAccountInput): Promise<AuthAccount> {
    const client = this.getClient();
    const accountId = randomUUID();

    try {
      const createdAccount = await client.authAccount.create({
        data: AuthAccountMapper.toPersistence(input, accountId),
        select: AuthAccountMapper.select,
      });

      return AuthAccountMapper.toDomain(createdAccount);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async linkOAuthAccount(input: LinkOAuthAccountInput): Promise<void> {
    const client = this.getClient();

    try {
      await client.oAuthAccount.create({
        data: {
          authAccountId: input.authAccountId,
          provider: input.provider,
          providerId: input.providerId,
          email: input.email,
          name: input.name,
          avatarUrl: input.avatarUrl,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async markEmailVerified(input: {
    authAccountId: string;
    verifiedAt: Date;
  }): Promise<AuthAccount> {
    const client = this.getClient();

    try {
      const account = await client.authAccount.update({
        where: { id: input.authAccountId },
        data: { emailVerifiedAt: input.verifiedAt },
        select: AuthAccountMapper.select,
      });

      return AuthAccountMapper.toDomain(account);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updatePassword(input: {
    authAccountId: string;
    passwordHash: string;
    passwordChangedAt: Date;
  }): Promise<AuthAccount> {
    const client = this.getClient();

    try {
      const account = await client.authAccount.update({
        where: { id: input.authAccountId },
        data: {
          passwordHash: input.passwordHash,
          passwordChangedAt: input.passwordChangedAt,
        },
        select: AuthAccountMapper.select,
      });

      return AuthAccountMapper.toDomain(account);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
