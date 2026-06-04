import { Injectable } from '@nestjs/common';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import {
  CreateEmailVerificationTokenInput,
  EmailVerificationToken,
  EmailVerificationTokenRepository,
} from '@/modules/auth/domain/repositories/email-verification-token.repository.interface.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(
    input: CreateEmailVerificationTokenInput,
  ): Promise<EmailVerificationToken> {
    const client = this.getClient();

    try {
      return await client.emailVerificationToken.create({
        data: input,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    const client = this.getClient();

    try {
      return await client.emailVerificationToken.findUnique({
        where: { tokenHash },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async markUnusedByAuthAccountUsed(input: {
    authAccountId: string;
    usedAt: Date;
  }): Promise<void> {
    const client = this.getClient();

    try {
      await client.emailVerificationToken.updateMany({
        where: {
          authAccountId: input.authAccountId,
          usedAt: null,
        },
        data: { usedAt: input.usedAt },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async markUsed(input: {
    id: string;
    usedAt: Date;
  }): Promise<EmailVerificationToken> {
    const client = this.getClient();

    try {
      return await client.emailVerificationToken.update({
        where: { id: input.id },
        data: { usedAt: input.usedAt },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
