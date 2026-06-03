import { describe, expect, it, jest } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { RateLimiter } from '@/core/rate-limiting/ports/rate-limiter.port.js';
import { RateLimitGuard } from '@/core/rate-limiting/guards/rate-limit.guard.js';

describe('RateLimitGuard', () => {
  it('uses the default endpoint policy when no metadata is present', async () => {
    class UsersController {}
    const handler = function getUser() {};
    const rateLimiter = {
      consume: jest.fn(() => Promise.resolve({ allowed: true } as const)),
    } satisfies RateLimiter;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RateLimitGuard(reflector, rateLimiter);

    await expect(
      guard.canActivate(
        createHttpContext({
          controller: UsersController,
          handler,
          ip: '127.0.0.1',
        }),
      ),
    ).resolves.toBe(true);

    expect(rateLimiter.consume).toHaveBeenCalledWith({
      scope: 'endpoint:UsersController.getUser',
      identifier: 'ip:127.0.0.1',
      limit: 300,
      windowSeconds: 60,
      blockSeconds: 60,
    });
  });

  it('throws when the shared limiter rejects the request', async () => {
    class AuthController {}
    const handler = function login() {};
    const rateLimiter = {
      consume: jest.fn(() =>
        Promise.resolve({
          allowed: false,
          retryAt: new Date('2026-06-03T00:01:00.000Z'),
          retryAfterSeconds: 60,
        } as const),
      ),
    } satisfies RateLimiter;
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce('auth.login'),
    } as unknown as Reflector;
    const guard = new RateLimitGuard(reflector, rateLimiter);

    await expect(
      guard.canActivate(
        createHttpContext({
          controller: AuthController,
          handler,
          ip: '127.0.0.1',
        }),
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
      metadata: {
        action: 'endpoint:auth.login',
        retryAfterSeconds: 60,
      },
    });
  });
});

function createHttpContext(input: {
  controller: new () => object;
  handler: () => void;
  ip: string;
}): ExecutionContext {
  return {
    getClass: () => input.controller,
    getHandler: () => input.handler,
    switchToHttp: () => ({
      getRequest: () => ({
        ip: input.ip,
        socket: {},
        header: () => undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}
