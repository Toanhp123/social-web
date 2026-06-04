import { Injectable } from '@nestjs/common';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import {
  CreatePasswordResetTokenInput,
  PasswordResetToken,
  PasswordResetTokenRepository,
} from '@/modules/auth/domain/repositories/password-reset-token.repository.interface.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(
    input: CreatePasswordResetTokenInput,
  ): Promise<PasswordResetToken> {
    const client = this.getClient();

    try {
      return await client.passwordResetToken.create({
        data: input,
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
      await client.passwordResetToken.updateMany({
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

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const client = this.getClient();

    try {
      return await client.passwordResetToken.findUnique({
        where: { tokenHash },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async markUsed(input: {
    id: string;
    usedAt: Date;
  }): Promise<PasswordResetToken> {
    const client = this.getClient();

    try {
      return await client.passwordResetToken.update({
        where: { id: input.id },
        data: { usedAt: input.usedAt },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
