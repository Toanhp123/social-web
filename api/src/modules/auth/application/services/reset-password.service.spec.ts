import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { ResetPasswordService } from '@/modules/auth/application/services/reset-password.service.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { PasswordResetTokenRepository } from '@/modules/auth/domain/repositories/password-reset-token.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';

describe('ResetPasswordService', () => {
  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let passwordResetTokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let executeTransaction: jest.Mock;
  let service: ResetPasswordService;

  beforeEach(() => {
    authAccountRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByOAuthAccount: jest.fn(),
      register: jest.fn(),
      linkOAuthAccount: jest.fn(),
      markEmailVerified: jest.fn(),
      updatePassword: jest.fn(),
    };

    passwordResetTokenRepository = {
      create: jest.fn(),
      markUnusedByAuthAccountUsed: jest.fn(),
      findByTokenHash: jest.fn(),
      markUsed: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-password-hash'),
      compare: jest.fn(),
    };

    tokenHasher = {
      hash: jest.fn().mockReturnValue('token-hash'),
    };

    sessionRepository = {
      create: jest.fn(),
      revokeActiveByDevice: jest.fn(),
      revokeActiveByAuthAccount: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByRotatedRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    executeTransaction = jest.fn((fn: () => Promise<unknown>) => fn());

    service = new ResetPasswordService(
      authAccountRepository,
      passwordResetTokenRepository,
      passwordHasher,
      tokenHasher,
      sessionRepository,
      { execute: executeTransaction } as unknown as UnitOfWork,
    );
  });

  it('updates the password, consumes the token, and revokes active sessions', async () => {
    const account = new AuthAccount(
      'account-1',
      'user@example.com',
      'old-password-hash',
      UserRole.USER,
    );
    const resetToken = {
      id: 'token-1',
      authAccountId: account.id,
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    };

    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(resetToken);
    authAccountRepository.findById.mockResolvedValue(account);

    await service.execute({
      token: 'plain-token',
      password: 'new-password',
    });

    expect(tokenHasher.hash).toHaveBeenCalledWith('plain-token');
    expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
    expect(executeTransaction).toHaveBeenCalledTimes(1);
    expect(authAccountRepository.updatePassword).toHaveBeenCalledWith({
      authAccountId: account.id,
      passwordHash: 'new-password-hash',
      passwordChangedAt: expect.any(Date) as Date,
    });
    expect(passwordResetTokenRepository.markUsed).toHaveBeenCalledWith({
      id: resetToken.id,
      usedAt: expect.any(Date) as Date,
    });
    expect(sessionRepository.revokeActiveByAuthAccount).toHaveBeenCalledWith({
      authAccountId: account.id,
      reason: 'PASSWORD_RESET',
    });
  });

  it('rejects expired reset tokens before changing the password', async () => {
    passwordResetTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'token-1',
      authAccountId: 'account-1',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      createdAt: new Date(),
    });

    await expect(
      service.execute({
        token: 'plain-token',
        password: 'new-password',
      }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.INVALID_PASSWORD_RESET_TOKEN,
      statusCode: 400,
    });

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(executeTransaction).not.toHaveBeenCalled();
    expect(authAccountRepository.updatePassword).not.toHaveBeenCalled();
  });
});
