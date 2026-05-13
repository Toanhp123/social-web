import { Injectable } from '@nestjs/common';
import type { DatabaseTransaction } from '../../../../core/databases/unit-of-work.interface.js';
import { mapPrismaError } from '../../../../core/mappers/prisma-error.mapper.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import {
  CreateSessionInput,
  SessionRepository,
} from '../../domain/repositories/session.repository.interface.js';
import { Session } from '../../domain/entities/session.entity.js';
import { SessionMapper } from './mappers/session.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: DatabaseTransaction): PrismaClientLike {
    return tx ? (tx as unknown as Prisma.TransactionClient) : this.prisma;
  }

  async create(
    input: CreateSessionInput,
    tx?: DatabaseTransaction,
  ): Promise<Session> {
    const client = this.getClient(tx);

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
    try {
      const session = await this.prisma.session.findUnique({
        where: { refreshTokenHash },
        select: this.selectSession(),
      });

      return session ? SessionMapper.toDomain(session) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async rotateRefreshToken(input: {
    sessionId: string;
    currentRefreshTokenHash: string;
    nextRefreshTokenHash: string;
    expiresAt: Date;
  }): Promise<boolean> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          id: input.sessionId,
          refreshTokenHash: input.currentRefreshTokenHash,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          refreshTokenHash: input.nextRefreshTokenHash,
          expiresAt: input.expiresAt,
          lastUsedAt: new Date(),
        },
      });

      return result.count === 1;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async revokeByRefreshTokenHash(
    refreshTokenHash: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.prisma.session.updateMany({
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
