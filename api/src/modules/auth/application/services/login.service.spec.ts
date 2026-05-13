import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { AuthAccount } from '../../domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { PasswordHasher } from '../../application/ports/password-hasher.port.js';
import { TokenService } from '../../application/ports/token-service.port.js';
import { TokenHasher } from '../ports/token-hasher.port.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { LoginService } from './login.service.js';

describe('LoginService', () => {
  const authAccount = new AuthAccount(
    'user-1',
    'user@example.com',
    'hashed-password',
    UserRole.USER,
  );

  let tokenService: jest.Mocked<TokenService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let service: LoginService;

  beforeEach(() => {
    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getRefreshTokenExpiresAt: jest
        .fn()
        .mockReturnValue(new Date('2030-01-01T00:00:00.000Z')),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    authAccountRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      register: jest.fn(),
    };

    sessionRepository = {
      create: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    tokenHasher = {
      hash: jest.fn().mockReturnValue('refresh-token-hash'),
    };

    service = new LoginService(
      tokenService,
      passwordHasher,
      sessionRepository,
      tokenHasher,
      authAccountRepository,
    );
  });

  it('returns access and refresh tokens when credentials are valid', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(authAccount);
    passwordHasher.compare.mockResolvedValue(true);

    const result = await service.execute('user@example.com', 'plain-password');

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(authAccountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
        role: UserRole.USER,
      }),
    );
    expect(sessionRepository.create).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      refreshTokenHash: 'refresh-token-hash',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
  });

  it('normalizes email before looking up the account', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(authAccount);
    passwordHasher.compare.mockResolvedValue(true);

    await service.execute(' USER@example.com ', 'plain-password');

    expect(authAccountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
  });

  it('throws invalid email before looking up the account', async () => {
    await expect(
      service.execute('invalid-email', 'plain-password'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(authAccountRepository.findByEmail).not.toHaveBeenCalled();
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('throws invalid credentials when user does not exist', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute('missing@example.com', 'plain-password'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_CREDENTIALS,
      statusCode: 401,
    });
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });

  it('throws invalid credentials when password does not match', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(authAccount);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      service.execute('user@example.com', 'wrong-password'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });

  it('throws when account is disabled', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(
      new AuthAccount(
        'user-1',
        'user@example.com',
        'hashed-password',
        UserRole.USER,
        null,
        null,
        new Date(),
      ),
    );
    passwordHasher.compare.mockResolvedValue(true);

    await expect(
      service.execute('user@example.com', 'plain-password'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_DISABLED,
      statusCode: 403,
    });
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
  });

  it('returns invalid credentials for disabled accounts with a wrong password', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(
      new AuthAccount(
        'user-1',
        'user@example.com',
        'hashed-password',
        UserRole.USER,
        null,
        null,
        new Date(),
      ),
    );
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      service.execute('user@example.com', 'wrong-password'),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });
});
