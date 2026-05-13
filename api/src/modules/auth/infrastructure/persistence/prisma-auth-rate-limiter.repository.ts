import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { mapPrismaError } from '../../../../core/mappers/prisma-error.mapper.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import type {
  AuthRateLimitAction,
  AuthRateLimitInput,
  AuthRateLimiter,
} from '../../application/ports/auth-rate-limiter.port.js';

type AuthRateLimitPolicy = {
  limit: number;
  windowSeconds: number;
  blockSeconds: number;
};

const AUTH_RATE_LIMIT_POLICIES: Record<
  AuthRateLimitAction,
  AuthRateLimitPolicy
> = {
  login: {
    limit: 5,
    windowSeconds: 15 * 60,
    blockSeconds: 15 * 60,
  },
  register: {
    limit: 5,
    windowSeconds: 60 * 60,
    blockSeconds: 60 * 60,
  },
  refresh: {
    limit: 60,
    windowSeconds: 60,
    blockSeconds: 60,
  },
};

@Injectable()
export class PrismaAuthRateLimiterRepository implements AuthRateLimiter {
  constructor(private readonly prisma: PrismaService) {}

  async assertAllowed(input: AuthRateLimitInput): Promise<void> {
    const policy = AUTH_RATE_LIMIT_POLICIES[input.action];
    const action = `auth:${input.action}`;

    for (const identifier of this.getIdentifiers(input)) {
      await this.consume(identifier, action, policy);
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
  ): Promise<void> {
    const now = new Date();

    try {
      await this.prisma.$transaction(async (tx) => {
        const key = {
          identifier_action: {
            identifier,
            action,
          },
        };
        const current = await tx.rateLimit.findUnique({ where: key });

        if (!current || current.expiresAt.getTime() <= now.getTime()) {
          await tx.rateLimit.upsert({
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
          return;
        }

        if (
          current.blockedUntil &&
          current.blockedUntil.getTime() > now.getTime()
        ) {
          throw this.createRateLimitError(action, current.blockedUntil, now);
        }

        if (current.count >= policy.limit) {
          const blockedUntil = this.addSeconds(now, policy.blockSeconds);

          await tx.rateLimit.update({
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
          throw this.createRateLimitError(action, blockedUntil, now);
        }

        await tx.rateLimit.update({
          where: key,
          data: {
            count: {
              increment: 1,
            },
            lastRequestAt: now,
          },
        });
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
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
