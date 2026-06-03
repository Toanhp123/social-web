import { describe, expect, it, jest } from '@jest/globals';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
import { RedisRateLimiter } from '@/infrastructure/rate-limiting/redis-rate-limiter.js';

describe('RedisRateLimiter', () => {
  it('consumes a Redis key with a counter and block key', async () => {
    const redis = {
      eval: jest.fn(() => Promise.resolve([1, 0] as [number, number])),
    };
    const redisService = {
      getClient: jest.fn().mockReturnValue(redis),
    } as unknown as RedisService;
    const rateLimiter = new RedisRateLimiter(redisService);

    await expect(
      rateLimiter.consume({
        scope: 'endpoint:auth.login',
        identifier: 'ip:127.0.0.1',
        limit: 30,
        windowSeconds: 60,
        blockSeconds: 60,
      }),
    ).resolves.toEqual({ allowed: true });

    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'rate-limit:endpoint:auth.login:ip:127.0.0.1:count',
      'rate-limit:endpoint:auth.login:ip:127.0.0.1:block',
      30,
      60_000,
      60_000,
      expect.any(Number),
    );
  });

  it('returns retry metadata when Redis reports a blocked key', async () => {
    const now = Date.now();
    const retryAt = now + 60_000;
    const redis = {
      eval: jest.fn(() => Promise.resolve([0, retryAt] as [number, number])),
    };
    const redisService = {
      getClient: jest.fn().mockReturnValue(redis),
    } as unknown as RedisService;
    const rateLimiter = new RedisRateLimiter(redisService);

    await expect(
      rateLimiter.consume({
        scope: 'endpoint:auth.login',
        identifier: 'ip:127.0.0.1',
        limit: 30,
        windowSeconds: 60,
        blockSeconds: 60,
      }),
    ).resolves.toMatchObject({
      allowed: false,
      retryAfterSeconds: expect.any(Number),
    });
  });
});
