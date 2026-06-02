import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaAuthRateLimiterRepository } from '@/modules/auth/infrastructure/persistence/prisma-auth-rate-limiter.repository.js';

describe('PrismaAuthRateLimiterRepository', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('persists blockedUntil before throwing when a limit is exceeded', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    const currentRateLimit = {
      identifier: 'ip:127.0.0.1',
      action: 'auth:login',
      count: 5,
      window: 900,
      lastRequestAt: now,
      expiresAt: new Date('2026-06-02T00:10:00.000Z'),
      blockedUntil: null,
    };
    const tx = {
      rateLimit: {
        findUnique: jest.fn().mockResolvedValue(currentRateLimit),
        update: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue(null),
      },
    };
    let transactionRejected = false;
    const prisma = {
      $transaction: jest.fn(
        async (fn: (client: typeof tx) => Promise<unknown>) => {
          try {
            return await fn(tx);
          } catch (error) {
            transactionRejected = true;
            throw error;
          }
        },
      ),
    } as unknown as PrismaService;
    const repository = new PrismaAuthRateLimiterRepository(prisma);

    await expect(
      repository.assertAllowed({ action: 'login', ip: '127.0.0.1' }),
    ).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
    });

    const updateInput = tx.rateLimit.update.mock.calls[0]?.[0] as {
      data: {
        blockedUntil: Date;
        expiresAt: Date;
      };
    };

    expect(transactionRejected).toBe(false);
    expect(updateInput.data.blockedUntil).toEqual(
      new Date('2026-06-02T00:15:00.000Z'),
    );
    expect(updateInput.data.expiresAt).toEqual(updateInput.data.blockedUntil);
  });
});
