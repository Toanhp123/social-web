import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { getAuthRateLimitPolicy } from '@/modules/auth/application/policies/auth-rate-limit.policy.js';
import { PrismaAuthRateLimiterRepository } from '@/modules/auth/infrastructure/persistence/prisma-auth-rate-limiter.repository.js';

describe('PrismaAuthRateLimiterRepository', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('persists blockedUntil before throwing when a limit is exceeded', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const policy = getAuthRateLimitPolicy('login');
    const expectedBlockedUntil = new Date(
      now.getTime() + policy.blockSeconds * 1_000,
    );

    const currentRateLimit = {
      identifier: 'ip:127.0.0.1',
      action: 'auth:login',
      count: 5,
      window: 900,
      lastRequestAt: now,
      expiresAt: new Date('2026-06-02T00:01:00.000Z'),
      blockedUntil: null,
    };
    const tx = {
      rateLimit: {
        findUnique: jest.fn().mockResolvedValue(currentRateLimit),
        update: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue(null),
      },
    };
    const prisma = {
      rateLimit: tx.rateLimit,
    } as unknown as PrismaService;
    const txContext = {
      getClient: jest.fn().mockReturnValue(undefined),
    } as unknown as PrismaTransactionContext;
    const repository = new PrismaAuthRateLimiterRepository(prisma, txContext);

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

    expect(updateInput.data.blockedUntil).toEqual(expectedBlockedUntil);
    expect(updateInput.data.expiresAt).toEqual(updateInput.data.blockedUntil);
  });

  it('uses the transaction context client when one is active', async () => {
    const now = new Date('2026-06-02T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    const tx = {
      rateLimit: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue(null),
      },
    };
    const prisma = {} as unknown as PrismaService;
    const txContext = {
      getClient: jest.fn().mockReturnValue(tx),
    } as unknown as PrismaTransactionContext;
    const repository = new PrismaAuthRateLimiterRepository(prisma, txContext);

    await repository.assertAllowed({ action: 'login', ip: '127.0.0.1' });

    expect(tx.rateLimit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          identifier: 'ip:127.0.0.1',
          action: 'auth:login',
          count: 1,
        }),
      }),
    );
  });
});
