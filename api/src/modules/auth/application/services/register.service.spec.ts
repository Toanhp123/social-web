import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DatabaseError } from '../../../../core/exceptions/database.exception.js';
import { DomainError } from '../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { UnitOfWork } from '../../../../core/databases/unit-of-work.interface.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { AuthAccount } from '../../domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { PasswordHasher } from '../../application/ports/password-hasher.port.js';
import { TokenService } from '../../application/ports/token-service.port.js';
import { TokenHasher } from '../ports/token-hasher.port.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';
import { RegisterService } from './register.service.js';

describe('RegisterService', () => {
  const createdAuthAccount = new AuthAccount(
    'user-1',
    'user@example.com',
    'hashed-password',
    UserRole.USER,
  );

  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let uow: UnitOfWork;
  let executeTransaction: jest.Mock;
  let tx: unknown;
  let service: RegisterService;

  beforeEach(() => {
    tx = { tx: true };
    executeTransaction = jest.fn((fn: (tx: never) => Promise<unknown>) =>
      fn(tx as never),
    );

    authAccountRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      register: jest.fn(),
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
      findByRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    tokenHasher = {
      hash: jest.fn().mockReturnValue('refresh-token-hash'),
    };

    service = new RegisterService(
      authAccountRepository,
      tokenService,
      passwordHasher,
      sessionRepository,
      tokenHasher,
      uow,
    );
  });

  it('creates a user inside a transaction and returns tokens', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockResolvedValue(createdAuthAccount);

    const result = await service.execute({
      fullName: 'Example User',
      email: 'USER@example.com',
      password: 'secret123',
      username: 'exampleuser',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    expect(executeTransaction).toHaveBeenCalledTimes(1);
    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(passwordHasher.hash.mock.invocationCallOrder[0]).toBeLessThan(
      executeTransaction.mock.invocationCallOrder[0],
    );
    expect(authAccountRepository.register).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Example User',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
        username: 'exampleuser',
      }),
      tx,
    );
    expect(sessionRepository.create).toHaveBeenCalledWith(
      {
        authAccountId: 'user-1',
        refreshTokenHash: 'refresh-token-hash',
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
      tx,
    );
  });

  it('throws when email already exists', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(createdAuthAccount);

    await expect(
      service.execute({
        fullName: 'Example User',
        email: 'user@example.com',
        password: 'secret123',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(executeTransaction).not.toHaveBeenCalled();
    expect(authAccountRepository.register).not.toHaveBeenCalled();
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
      service.execute({
        fullName: 'Example User',
        email: 'user@example.com',
        password: 'secret123',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USER_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it('maps duplicate username to username already exists', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);
    authAccountRepository.register.mockRejectedValue(
      new DatabaseError(
        'Duplicate field',
        { meta: { target: ['username'] } },
        ErrorCode.DUPLICATE_FIELD,
        409,
      ),
    );

    await expect(
      service.execute({
        fullName: 'Example User',
        email: 'user@example.com',
        password: 'secret123',
        username: 'exampleuser',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.USERNAME_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it('throws when password is weak before hashing', async () => {
    authAccountRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute({
        fullName: 'Example User',
        email: 'user@example.com',
        password: '123',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.WEAK_PASSWORD,
      statusCode: 400,
    });

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(executeTransaction).not.toHaveBeenCalled();
  });
});
