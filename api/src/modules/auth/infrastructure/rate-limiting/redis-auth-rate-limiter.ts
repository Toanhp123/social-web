import { Injectable } from '@nestjs/common';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
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

const CONSUME_RATE_LIMIT_SCRIPT = `
local counterKey = KEYS[1]
local blockKey = KEYS[2]
local limit = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local blockMs = tonumber(ARGV[3])
local nowMs = tonumber(ARGV[4])

local blockTtl = redis.call('PTTL', blockKey)
if blockTtl > 0 then
  return { 0, nowMs + blockTtl }
end

if blockTtl == -1 then
  redis.call('DEL', blockKey)
end

local count = redis.call('INCR', counterKey)
if count == 1 then
  redis.call('PEXPIRE', counterKey, windowMs)
else
  local counterTtl = redis.call('PTTL', counterKey)
  if counterTtl < 0 then
    redis.call('PEXPIRE', counterKey, windowMs)
  end
end

if count > limit then
  local retryAtMs = nowMs + blockMs
  redis.call('SET', blockKey, retryAtMs, 'PX', blockMs)

  local counterTtl = redis.call('PTTL', counterKey)
  if counterTtl < blockMs then
    redis.call('PEXPIRE', counterKey, blockMs)
  end

  return { 0, retryAtMs }
end

return { 1, 0 }
`;

@Injectable()
export class RedisAuthRateLimiter implements AuthRateLimiter {
  constructor(private readonly redisService: RedisService) {}

  async assertAllowed(input: AuthRateLimitInput): Promise<void> {
    const policy = getAuthRateLimitPolicy(input.action);
    const action = `auth:${input.action}`;

    try {
      for (const identifier of this.getIdentifiers(input)) {
        const violation = await this.consume(identifier, action, policy);

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

      throw new DatabaseError(
        'Rate limiter storage error',
        { component: 'redis', operation: 'auth-rate-limit' },
        ErrorCode.DATABASE_ERROR,
        500,
        error,
      );
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
    const now = Date.now();
    const result = await this.redisService
      .getClient()
      .eval(
        CONSUME_RATE_LIMIT_SCRIPT,
        2,
        this.createCounterKey(action, identifier),
        this.createBlockKey(action, identifier),
        policy.limit,
        policy.windowSeconds * 1_000,
        policy.blockSeconds * 1_000,
        now,
      );
    const [allowed, retryAtMs] = this.parseScriptResult(result);

    if (allowed) {
      return null;
    }

    return { retryAt: new Date(retryAtMs) };
  }

  private parseScriptResult(result: unknown): [boolean, number] {
    if (!Array.isArray(result)) {
      throw new Error('Redis rate limit script returned an invalid result');
    }

    const resultItems: unknown[] = result;
    const allowed = resultItems[0];
    const retryAtMs = resultItems[1];

    if (typeof allowed !== 'number' || typeof retryAtMs !== 'number') {
      throw new Error('Redis rate limit script returned an invalid payload');
    }

    return [allowed === 1, retryAtMs];
  }

  private createCounterKey(action: string, identifier: string): string {
    return `rate-limit:${action}:${identifier}:count`;
  }

  private createBlockKey(action: string, identifier: string): string {
    return `rate-limit:${action}:${identifier}:block`;
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
}
