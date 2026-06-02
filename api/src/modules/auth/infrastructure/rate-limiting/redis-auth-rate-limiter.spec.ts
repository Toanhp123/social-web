import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
import { getAuthRateLimitPolicy } from '@/modules/auth/application/policies/auth-rate-limit.policy.js';
import { RedisAuthRateLimiter } from '@/modules/auth/infrastructure/rate-limiting/redis-auth-rate-limiter.js';

describe('RedisAuthRateLimiter', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('throws a rate limit error when Redis reports a violation', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const policy = getAuthRateLimitPolicy('login');
    const retryAt = now.getTime() + policy.blockSeconds * 1_000;
    const redis = {
      eval: jest.fn(() => Promise.resolve([0, retryAt] as [number, number])),
    };
    const redisService = {
      getClient: jest.fn().mockReturnValue(redis),
    } as unknown as RedisService;
    const rateLimiter = new RedisAuthRateLimiter(redisService);

    await expect(
      rateLimiter.assertAllowed({ action: 'login', ip: '127.0.0.1' }),
    ).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
      metadata: {
        action: 'auth:login',
        retryAfterSeconds: policy.blockSeconds,
      },
    });
  });

  it('consumes distinct ip, subject, and device identifiers', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const redis = {
      eval: jest.fn(() => Promise.resolve([1, 0] as [number, number])),
    };
    const redisService = {
      getClient: jest.fn().mockReturnValue(redis),
    } as unknown as RedisService;
    const rateLimiter = new RedisAuthRateLimiter(redisService);

    await rateLimiter.assertAllowed({
      action: 'register',
      ip: '127.0.0.1',
      subject: 'User@Example.com',
      deviceId: 'device-1',
    });

    expect(redis.eval).toHaveBeenCalledTimes(3);
    expect(redis.eval).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      2,
      'rate-limit:auth:register:ip:127.0.0.1:count',
      'rate-limit:auth:register:ip:127.0.0.1:block',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      now.getTime(),
    );
    expect(redis.eval).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      2,
      'rate-limit:auth:register:subject:user@example.com:count',
      'rate-limit:auth:register:subject:user@example.com:block',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      now.getTime(),
    );
    expect(redis.eval).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      2,
      'rate-limit:auth:register:device:device-1:count',
      'rate-limit:auth:register:device:device-1:block',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      now.getTime(),
    );
  });
});
