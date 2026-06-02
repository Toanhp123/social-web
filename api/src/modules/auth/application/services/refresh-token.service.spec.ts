import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { Session } from '@/modules/auth/domain/entities/session.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { RefreshTokenService } from '@/modules/auth/application/services/refresh-token.service.js';
import { AuthRateLimiter } from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';

describe('RefreshTokenService', () => {
  let tokenService: jest.Mocked<TokenService>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let authRateLimiter: jest.Mocked<AuthRateLimiter>;
  let uow: UnitOfWork;
  let executeTransaction: jest.Mock;
  let service: RefreshTokenService;

  const refreshRateLimit = {
    action: 'refresh' as const,
    ip: '127.0.0.1',
  };

  beforeEach(() => {
    executeTransaction = jest.fn((fn: () => Promise<unknown>) => fn());

    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue(
          new JwtPayload('user-1', 'user@example.com', UserRole.USER),
        ),
      getRefreshTokenExpiresAt: jest
        .fn()
        .mockReturnValue(new Date('2030-01-01T00:00:00.000Z')),
    };

    tokenHasher = {
      hash: jest
        .fn()
        .mockReturnValueOnce('old-refresh-token-hash')
        .mockReturnValueOnce('new-refresh-token-hash'),
    };

    sessionRepository = {
      create: jest.fn(),
      revokeActiveByDevice: jest.fn(),
      revokeActiveByAuthAccount: jest.fn(),
      findByRefreshTokenHash: jest
        .fn()
        .mockResolvedValue(
          new Session(
            'session-1',
            'user-1',
            'old-refresh-token-hash',
            false,
            new Date('2030-01-01T00:00:00.000Z'),
            new Date('2029-01-01T00:00:00.000Z'),
            null,
          ),
        ),
      findByRotatedRefreshTokenHash: jest.fn().mockResolvedValue(null),
      rotateRefreshToken: jest.fn().mockResolvedValue(true),
      revokeByRefreshTokenHash: jest.fn(),
    };

    authAccountRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(
          new AuthAccount(
            'user-1',
            'user@example.com',
            'hashed-password',
            UserRole.USER,
          ),
        ),
      findByEmail: jest.fn(),
      register: jest.fn(),
    };

    authRateLimiter = {
      assertAllowed: jest.fn().mockResolvedValue(undefined),
    };

    uow = {
      execute: executeTransaction,
    } as unknown as UnitOfWork;

    service = new RefreshTokenService(
      tokenService,
      tokenHasher,
      sessionRepository,
      authAccountRepository,
      authRateLimiter,
      uow,
    );
  });

  it('rotates refresh token and returns a new access token when refresh token is valid', async () => {
    tokenService.generateRefreshToken.mockReturnValue('next-refresh-token');

    const result = await service.execute('refresh-token', refreshRateLimit);

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'next-refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
      'refresh-token',
    );
    expect(authRateLimiter.assertAllowed).toHaveBeenCalledWith(
      refreshRateLimit,
    );
    expect(sessionRepository.findByRefreshTokenHash).toHaveBeenCalledWith(
      'old-refresh-token-hash',
    );
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
        role: UserRole.USER,
      }),
    );
    expect(sessionRepository.rotateRefreshToken).toHaveBeenCalledWith({
      sessionId: 'session-1',
      currentRefreshTokenHash: 'old-refresh-token-hash',
      currentRefreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
      nextRefreshTokenHash: 'new-refresh-token-hash',
      nextRefreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(executeTransaction).toHaveBeenCalledTimes(1);
  });

  it('throws when refresh token is missing', async () => {
    await expect(
      service.execute(undefined, refreshRateLimit),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
      statusCode: 401,
    });
    expect(tokenService.verifyRefreshToken).not.toHaveBeenCalled();
  });

  it('throws when session is not found', async () => {
    sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);

    await expect(
      service.execute('refresh-token', refreshRateLimit),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
      statusCode: 401,
    });
    expect(
      sessionRepository.findByRotatedRefreshTokenHash,
    ).toHaveBeenCalledWith('old-refresh-token-hash');
    expect(sessionRepository.revokeActiveByAuthAccount).not.toHaveBeenCalled();
    expect(sessionRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('revokes active account sessions when a rotated refresh token is reused', async () => {
    sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);
    sessionRepository.findByRotatedRefreshTokenHash.mockResolvedValue(
      new Session(
        'session-1',
        'user-1',
        'new-refresh-token-hash',
        false,
        new Date('2030-01-01T00:00:00.000Z'),
        new Date('2029-01-01T00:00:00.000Z'),
        new Date('2029-06-01T00:00:00.000Z'),
      ),
    );

    await expect(
      service.execute('refresh-token', refreshRateLimit),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
      statusCode: 401,
    });
    expect(sessionRepository.revokeActiveByAuthAccount).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      reason: 'REFRESH_TOKEN_REUSE',
    });
    expect(sessionRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('throws when refresh token rotation loses the race', async () => {
    sessionRepository.rotateRefreshToken.mockResolvedValue(false);

    await expect(
      service.execute('refresh-token', refreshRateLimit),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
      statusCode: 401,
    });
    expect(sessionRepository.revokeActiveByAuthAccount).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      reason: 'REFRESH_TOKEN_REUSE',
    });
  });

  it('identifies refresh token failures', () => {
    expect(
      service.isRefreshTokenFailure(
        new DomainError(
          ErrorCode.INVALID_REFRESH_TOKEN,
          'Invalid refresh token',
          401,
        ),
      ),
    ).toBe(true);
    expect(
      service.isRefreshTokenFailure(
        new DomainError(
          ErrorCode.REFRESH_TOKEN_REUSE_DETECTED,
          'Refresh token reuse detected',
          401,
        ),
      ),
    ).toBe(true);
    expect(
      service.isRefreshTokenFailure(
        new DomainError(ErrorCode.INVALID_TOKEN, 'Invalid token', 401),
      ),
    ).toBe(false);
    expect(service.isRefreshTokenFailure(new Error('Unknown'))).toBe(false);
  });
});
