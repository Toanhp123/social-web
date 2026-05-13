import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';
import { TokenService } from '../../application/ports/token-service.port.js';
import { AuthAccount } from '../../domain/entities/auth-account.entity.js';
import { Session } from '../../domain/entities/session.entity.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { TokenHasher } from '../ports/token-hasher.port.js';
import { RefreshTokenService } from './refresh-token.service.js';

describe('RefreshTokenService', () => {
  let tokenService: jest.Mocked<TokenService>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let service: RefreshTokenService;

  beforeEach(() => {
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

    service = new RefreshTokenService(
      tokenService,
      tokenHasher,
      sessionRepository,
      authAccountRepository,
    );
  });

  it('rotates refresh token and returns a new access token when refresh token is valid', async () => {
    tokenService.generateRefreshToken.mockReturnValue('next-refresh-token');

    const result = await service.execute('refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'next-refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
      'refresh-token',
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
      nextRefreshTokenHash: 'new-refresh-token-hash',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
  });

  it('throws when refresh token is missing', async () => {
    await expect(service.execute(undefined)).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
      statusCode: 401,
    });
    expect(tokenService.verifyRefreshToken).not.toHaveBeenCalled();
  });

  it('throws when session is not found', async () => {
    sessionRepository.findByRefreshTokenHash.mockResolvedValue(null);

    await expect(service.execute('refresh-token')).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
      statusCode: 401,
    });
    expect(sessionRepository.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('throws when refresh token rotation loses the race', async () => {
    sessionRepository.rotateRefreshToken.mockResolvedValue(false);

    await expect(service.execute('refresh-token')).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
      statusCode: 401,
    });
  });
});
