import { Injectable } from '@nestjs/common';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import {
  getAuthRateLimitPolicy,
  type AuthRateLimitPolicy,
} from '@/modules/auth/application/policies/auth-rate-limit.policy.js';

type RateLimitViolation = {
  retryAt: Date;
};

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaAuthRateLimiterRepository implements AuthRateLimiter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async assertAllowed(input: AuthRateLimitInput): Promise<void> {
    const policy = getAuthRateLimitPolicy(input.action);
    const action = `auth:${input.action}`;
    const client = this.getClient();

    try {
      for (const identifier of this.getIdentifiers(input)) {
        const violation = await this.consume(
          identifier,
          action,
          policy,
          client,
        );

        if (violation) {
          throw this.createRateLimitError(
            action,
            violation.retryAt,
            new Date(),
          );
        }
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  private getIdentifiers(input: AuthRateLimitInput): string[] {
    const identifiers = [`ip:${input.ip?.trim() || 'unknown'}`];
    const subject = input.subject?.trim().toLowerCase();
    const deviceId = input.deviceId?.trim();

    if (subject) {
      identifiers.push(`subject:${subject}`);
    }

    if (deviceId) {
      identifiers.push(`device:${deviceId}`);
    }

    return [...new Set(identifiers)];
  }

  private async consume(
    identifier: string,
    action: string,
    policy: AuthRateLimitPolicy,
    client: PrismaClientLike,
  ): Promise<RateLimitViolation | null> {
    const now = new Date();

    const key = {
      identifier_action: {
        identifier,
        action,
      },
    };
    const current = await client.rateLimit.findUnique({ where: key });

    if (!current || current.expiresAt.getTime() <= now.getTime()) {
      await client.rateLimit.upsert({
        where: key,
        create: {
          identifier,
          action,
          count: 1,
          window: policy.windowSeconds,
          lastRequestAt: now,
          expiresAt: this.addSeconds(now, policy.windowSeconds),
        },
        update: {
          count: 1,
          window: policy.windowSeconds,
          lastRequestAt: now,
          expiresAt: this.addSeconds(now, policy.windowSeconds),
          blockedUntil: null,
        },
      });
      return null;
    }

    if (
      current.blockedUntil &&
      current.blockedUntil.getTime() > now.getTime()
    ) {
      return { retryAt: current.blockedUntil };
    }

    if (current.count >= policy.limit) {
      const blockedUntil = this.addSeconds(now, policy.blockSeconds);

      await client.rateLimit.update({
        where: key,
        data: {
          count: {
            increment: 1,
          },
          lastRequestAt: now,
          expiresAt:
            current.expiresAt.getTime() > blockedUntil.getTime()
              ? current.expiresAt
              : blockedUntil,
          blockedUntil,
        },
      });

      return { retryAt: blockedUntil };
    }

    await client.rateLimit.update({
      where: key,
      data: {
        count: {
          increment: 1,
        },
        lastRequestAt: now,
      },
    });

    return null;
  }

  private createRateLimitError(
    action: string,
    retryAt: Date,
    now: Date,
  ): DomainError {
    return new DomainError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      {
        action,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((retryAt.getTime() - now.getTime()) / 1_000),
        ),
      },
    );
  }

  private addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1_000);
  }
}
