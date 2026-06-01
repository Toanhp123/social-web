import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { RegisterService } from '@/modules/auth/application/services/register.service.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { AuthRateLimiter } from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';

describe('RegisterService', () => {
  const createdAuthAccount = new AuthAccount(
    'user-1',
    'user@example.com',
    'hashed-password',
    UserRole.USER,
  );

  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let authRateLimiter: jest.Mocked<AuthRateLimiter>;
  let deviceSessionService: jest.Mocked<DeviceSessionService>;
  let uow: UnitOfWork;
  let executeTransaction: jest.Mock;
  let service: RegisterService;

  const registerContext = {
    rateLimit: {
      action: 'register' as const,
      ip: '127.0.0.1',
      subject: 'user@example.com',
    },
  };

  beforeEach(() => {
    executeTransaction = jest.fn((fn: () => Promise<unknown>) => fn());

    authAccountRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      register: jest.fn(),
    };

    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

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
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };

    uow = {
      execute: executeTransaction,
    } as unknown as UnitOfWork;

    sessionRepository = {
      create: jest.fn(),
      revokeActiveByDevice: jest.fn(),
      revokeActiveByAuthAccount: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByRotatedRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    tokenHasher = {
      hash: jest.fn().mockReturnValue('refresh-token-hash'),
    };

    authRateLimiter = {
      assertAllowed: jest.fn().mockResolvedValue(undefined),
    };

    deviceSessionService = {
      replaceActiveSessionForDevice: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DeviceSessionService>;

    service = new RegisterService(
      authAccountRepository,
      userRepository,
      tokenService,
      passwordHasher,
      sessionRepository,
      tokenHasher,
      uow,
      authRateLimiter,
      deviceSessionService,
    );
  });

  it('creates a user inside a transaction and returns tokens', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockResolvedValue(createdAuthAccount);

    const result = await service.execute(
      {
        fullName: 'Example User',
        email: 'USER@example.com',
        password: 'secret123',
        username: 'exampleuser',
      },
      registerContext,
    );

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(executeTransaction).toHaveBeenCalledTimes(1);
    expect(authRateLimiter.assertAllowed).toHaveBeenCalledWith(
      registerContext.rateLimit,
    );
    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(passwordHasher.hash.mock.invocationCallOrder[0]).toBeLessThan(
      executeTransaction.mock.invocationCallOrder[0],
    );
    expect(authAccountRepository.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
      }),
    );
    expect(userRepository.create).toHaveBeenCalledWith({
      id: 'user-1',
      fullName: 'Example User',
      username: 'exampleuser',
    });
    expect(sessionRepository.create).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      refreshTokenHash: 'refresh-token-hash',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
  });

  it('revokes an active session for the same device before creating a registration session', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockResolvedValue(createdAuthAccount);

    await service.execute(
      {
        fullName: 'Example User',
        email: 'USER@example.com',
        password: 'secret123',
      },
      {
        ...registerContext,
        sessionMetadata: {
          deviceId: 'device-1',
          device: 'Chrome',
        },
      },
    );

    expect(
      deviceSessionService.replaceActiveSessionForDevice,
    ).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      sessionMetadata: {
        deviceId: 'device-1',
        device: 'Chrome',
      },
      reason: 'REPLACED_BY_REGISTER',
    });
    expect(sessionRepository.create).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      refreshTokenHash: 'refresh-token-hash',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      deviceId: 'device-1',
      device: 'Chrome',
    });
  });

  it('throws when email already exists', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(createdAuthAccount);

    await expect(
      service.execute(
        {
          fullName: 'Example User',
          email: 'user@example.com',
          password: 'secret123',
        },
        registerContext,
      ),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(executeTransaction).not.toHaveBeenCalled();
    expect(authAccountRepository.register).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it('maps duplicate email race to user already exists', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockRejectedValue(
      new DatabaseError(
        'Duplicate field',
        { meta: { target: ['email'] } },
        ErrorCode.DUPLICATE_FIELD,
        409,
      ),
    );

    await expect(
      service.execute(
        {
          fullName: 'Example User',
          email: 'user@example.com',
          password: 'secret123',
        },
        registerContext,
      ),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it('maps duplicate username to username already exists', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockResolvedValue(createdAuthAccount);
    userRepository.create.mockRejectedValue(
      new DatabaseError(
        'Duplicate field',
        { meta: { target: ['username'] } },
        ErrorCode.DUPLICATE_FIELD,
        409,
      ),
    );

    await expect(
      service.execute(
        {
          fullName: 'Example User',
          email: 'user@example.com',
          password: 'secret123',
          username: 'exampleuser',
        },
        registerContext,
      ),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USERNAME_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it('throws when password is weak before hashing', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute(
        {
          fullName: 'Example User',
          email: 'user@example.com',
          password: '123',
        },
        registerContext,
      ),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.WEAK_PASSWORD,
      statusCode: 400,
    });

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(executeTransaction).not.toHaveBeenCalled();
  });
});
