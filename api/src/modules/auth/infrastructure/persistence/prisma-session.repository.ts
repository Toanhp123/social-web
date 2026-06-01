import { Injectable } from '@nestjs/common';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import {
  CreateSessionInput,
  SessionRepository,
} from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { Session } from '@/modules/auth/domain/entities/session.entity.js';
import { SessionMapper } from '@/modules/auth/infrastructure/persistence/mappers/session.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(input: CreateSessionInput): Promise<Session> {
    const client = this.getClient();

    try {
      const session = await client.session.create({
        data: input,
        select: this.selectSession(),
      });

      return SessionMapper.toDomain(session);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<Session | null> {
    const client = this.getClient();

    try {
      const session = await client.session.findUnique({
        where: { refreshTokenHash },
        select: this.selectSession(),
      });

      return session ? SessionMapper.toDomain(session) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByRotatedRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<Session | null> {
    const client = this.getClient();

    try {
      const rotatedRefreshToken = await client.rotatedRefreshToken.findUnique({
        where: { refreshTokenHash },
        select: {
          session: {
            select: this.selectSession(),
          },
        },
      });

      return rotatedRefreshToken
        ? SessionMapper.toDomain(rotatedRefreshToken.session)
        : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async revokeActiveByDevice(input: {
    authAccountId: string;
    deviceId: string;
    reason: string;
  }): Promise<void> {
    const client = this.getClient();

    try {
      await client.session.updateMany({
        where: {
          authAccountId: input.authAccountId,
          deviceId: input.deviceId,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          isRevoked: true,
          revokeReason: input.reason,
          revokedAt: new Date(),
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async revokeActiveByAuthAccount(input: {
    authAccountId: string;
    reason: string;
  }): Promise<void> {
    const client = this.getClient();

    try {
      await client.session.updateMany({
        where: {
          authAccountId: input.authAccountId,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          isRevoked: true,
          revokeReason: input.reason,
          revokedAt: new Date(),
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async rotateRefreshToken(input: {
    sessionId: string;
    currentRefreshTokenHash: string;
    currentRefreshTokenExpiresAt: Date;
    nextRefreshTokenHash: string;
    nextRefreshTokenExpiresAt: Date;
  }): Promise<boolean> {
    const txClient = this.txContext.getClient();

    try {
      if (txClient) {
        return await this.rotateRefreshTokenWithClient(txClient, input);
      }

      return await this.prisma.$transaction((tx) =>
        this.rotateRefreshTokenWithClient(tx, input),
      );
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private async rotateRefreshTokenWithClient(
    client: PrismaClientLike,
    input: {
      sessionId: string;
      currentRefreshTokenHash: string;
      currentRefreshTokenExpiresAt: Date;
      nextRefreshTokenHash: string;
      nextRefreshTokenExpiresAt: Date;
    },
  ): Promise<boolean> {
    const now = new Date();

    const result = await client.session.updateMany({
      where: {
        id: input.sessionId,
        refreshTokenHash: input.currentRefreshTokenHash,
        isRevoked: false,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        refreshTokenHash: input.nextRefreshTokenHash,
        expiresAt: input.nextRefreshTokenExpiresAt,
        lastUsedAt: now,
        refreshTokenRotatedAt: now,
      },
    });

    if (result.count !== 1) {
      return false;
    }

    await client.rotatedRefreshToken.create({
      data: {
        refreshTokenHash: input.currentRefreshTokenHash,
        sessionId: input.sessionId,
        rotatedAt: now,
        expiresAt: input.currentRefreshTokenExpiresAt,
      },
    });

    return true;
  }

  async revokeByRefreshTokenHash(
    refreshTokenHash: string,
    reason: string,
  ): Promise<void> {
    const client = this.getClient();

    try {
      await client.session.updateMany({
        where: {
          refreshTokenHash,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokeReason: reason,
          revokedAt: new Date(),
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private selectSession() {
    return {
      id: true,
      authAccountId: true,
      refreshTokenHash: true,
      isRevoked: true,
      expiresAt: true,
      createdAt: true,
      lastUsedAt: true,
    } as const;
  }
}
