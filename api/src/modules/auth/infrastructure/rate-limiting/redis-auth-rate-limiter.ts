import { Inject, Injectable } from '@nestjs/common';
import { RATE_LIMITER } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { RateLimiter } from '@/core/rate-limiting/ports/rate-limiter.port.js';
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
  retryAfterSeconds: number;
};

@Injectable()
export class RedisAuthRateLimiter implements AuthRateLimiter {
  constructor(
    @Inject(RATE_LIMITER)
    private readonly rateLimiter: RateLimiter,
  ) {}

  async assertAllowed(input: AuthRateLimitInput): Promise<void> {
    const policy = getAuthRateLimitPolicy(input.action);
    const action = `auth:${input.action}`;

    for (const identifier of this.getIdentifiers(input)) {
      const violation = await this.consume(identifier, action, policy);

      if (violation) {
        throw this.createRateLimitError(action, violation);
      }
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
  ): Promise<RateLimitViolation | null> {
    const result = await this.rateLimiter.consume({
      scope: action,
      identifier,
      ...policy,
    });

    if (result.allowed) {
      return null;
    }

    return {
      retryAt: result.retryAt,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }

  private createRateLimitError(
    action: string,
    violation: RateLimitViolation,
  ): DomainError {
    return new DomainError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      {
        action,
        retryAfterSeconds: violation.retryAfterSeconds,
      },
    );
  }
}
