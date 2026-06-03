import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { RateLimiter } from '@/core/rate-limiting/ports/rate-limiter.port.js';
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
    const rateLimiterPort = {
      consume: jest.fn(() =>
        Promise.resolve({
          allowed: false,
          retryAt: new Date(now.getTime() + policy.blockSeconds * 1_000),
          retryAfterSeconds: policy.blockSeconds,
        } as const),
      ),
    } satisfies RateLimiter;
    const rateLimiter = new RedisAuthRateLimiter(rateLimiterPort);

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
    const policy = getAuthRateLimitPolicy('register');
    const rateLimiterPort = {
      consume: jest.fn(() => Promise.resolve({ allowed: true } as const)),
    } satisfies RateLimiter;
    const rateLimiter = new RedisAuthRateLimiter(rateLimiterPort);

    await rateLimiter.assertAllowed({
      action: 'register',
      ip: '127.0.0.1',
      subject: 'User@Example.com',
      deviceId: 'device-1',
    });

    expect(rateLimiterPort.consume).toHaveBeenCalledTimes(3);
    expect(rateLimiterPort.consume).toHaveBeenNthCalledWith(1, {
      scope: 'auth:register',
      identifier: 'ip:127.0.0.1',
      ...policy,
    });
    expect(rateLimiterPort.consume).toHaveBeenNthCalledWith(2, {
      scope: 'auth:register',
      identifier: 'subject:user@example.com',
      ...policy,
    });
    expect(rateLimiterPort.consume).toHaveBeenNthCalledWith(3, {
      scope: 'auth:register',
      identifier: 'device:device-1',
      ...policy,
    });
  });
});
