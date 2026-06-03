import { Injectable } from '@nestjs/common';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type {
  RateLimitConsumeInput,
  RateLimitConsumeResult,
  RateLimiter,
} from '@/core/rate-limiting/ports/rate-limiter.port.js';
import { RedisService } from '@/infrastructure/redis/redis.service.js';

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
  if counterTtl < 0 or counterTtl < blockMs then
    redis.call('PEXPIRE', counterKey, blockMs)
  end

  return { 0, retryAtMs }
end

return { 1, 0 }
`;

@Injectable()
export class RedisRateLimiter implements RateLimiter {
  constructor(private readonly redisService: RedisService) {}

  async consume(input: RateLimitConsumeInput): Promise<RateLimitConsumeResult> {
    const now = Date.now();

    try {
      const result = await this.redisService
        .getClient()
        .eval(
          CONSUME_RATE_LIMIT_SCRIPT,
          2,
          this.createCounterKey(input.scope, input.identifier),
          this.createBlockKey(input.scope, input.identifier),
          input.limit,
          input.windowSeconds * 1_000,
          input.blockSeconds * 1_000,
          now,
        );
      const [allowed, retryAtMs] = this.parseScriptResult(result);

      if (allowed) {
        return { allowed: true };
      }

      return {
        allowed: false,
        retryAt: new Date(retryAtMs),
        retryAfterSeconds: Math.max(1, Math.ceil((retryAtMs - now) / 1_000)),
      };
    } catch (error) {
      throw new DatabaseError(
        'Rate limiter storage error',
        { component: 'redis', operation: 'rate-limit' },
        ErrorCode.DATABASE_ERROR,
        500,
        error,
      );
    }
  }

  private parseScriptResult(result: unknown): [boolean, number] {
    if (!Array.isArray(result) || result.length !== 2) {
      throw new Error('Redis rate limit script returned an invalid result');
    }

    const allowed = Number(result[0]);
    const retryAtMs = Number(result[1]);

    if (!Number.isFinite(allowed) || !Number.isFinite(retryAtMs)) {
      throw new Error('Redis rate limit script returned an invalid payload');
    }

    return [allowed === 1, retryAtMs];
  }

  private createCounterKey(scope: string, identifier: string): string {
    return `rate-limit:${scope}:${identifier}:count`;
  }

  private createBlockKey(scope: string, identifier: string): string {
    return `rate-limit:${scope}:${identifier}:block`;
  }
}
