import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { VerifyEmailService } from '@/modules/auth/application/services/verify-email.service.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { EmailVerificationTokenRepository } from '@/modules/auth/domain/repositories/email-verification-token.repository.interface.js';

describe('VerifyEmailService', () => {
  let authAccountRepository: jest.Mocked<AuthAccountRepository>;
  let emailVerificationTokenRepository: jest.Mocked<EmailVerificationTokenRepository>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let uow: UnitOfWork;
  let executeTransaction: jest.Mock;
  let service: VerifyEmailService;

  beforeEach(() => {
    authAccountRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByOAuthAccount: jest.fn(),
      register: jest.fn(),
      linkOAuthAccount: jest.fn(),
      markEmailVerified: jest.fn(),
    };

    emailVerificationTokenRepository = {
      create: jest.fn(),
      markUnusedByAuthAccountUsed: jest.fn(),
      findByTokenHash: jest.fn(),
      markUsed: jest.fn(),
    };

    tokenHasher = {
      hash: jest.fn().mockReturnValue('token-hash'),
    };

    executeTransaction = jest.fn((fn: () => Promise<unknown>) => fn());
    uow = { execute: executeTransaction } as unknown as UnitOfWork;

    service = new VerifyEmailService(
      authAccountRepository,
      emailVerificationTokenRepository,
      tokenHasher,
      uow,
    );
  });

  it('marks account email verified and consumes the token', async () => {
    const account = new AuthAccount(
      'account-1',
      'user@example.com',
      'password-hash',
      UserRole.USER,
    );
    const verificationToken = {
      id: 'token-1',
      authAccountId: account.id,
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    };

    emailVerificationTokenRepository.findByTokenHash.mockResolvedValue(
      verificationToken,
    );
    authAccountRepository.findById.mockResolvedValue(account);

    await service.execute('plain-token');

    expect(tokenHasher.hash).toHaveBeenCalledWith('plain-token');
    expect(executeTransaction).toHaveBeenCalledTimes(1);
    expect(authAccountRepository.markEmailVerified).toHaveBeenCalledWith({
      authAccountId: account.id,
      verifiedAt: expect.any(Date) as Date,
    });
    expect(emailVerificationTokenRepository.markUsed).toHaveBeenCalledWith({
      id: verificationToken.id,
      usedAt: expect.any(Date) as Date,
    });
  });

  it('rejects expired verification tokens', async () => {
    emailVerificationTokenRepository.findByTokenHash.mockResolvedValue({
      id: 'token-1',
      authAccountId: 'account-1',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      createdAt: new Date(),
    });

    await expect(service.execute('plain-token')).rejects.toMatchObject<
      Partial<DomainError>
    >({
      code: ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN,
      statusCode: 400,
    });

    expect(executeTransaction).not.toHaveBeenCalled();
    expect(authAccountRepository.markEmailVerified).not.toHaveBeenCalled();
    expect(emailVerificationTokenRepository.markUsed).not.toHaveBeenCalled();
  });
});
