import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  AUTH_RATE_LIMITER,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
  USER_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { TokenService } from '@/modules/auth/application/ports/token-service.port.js';
import type { PasswordHasher } from '@/modules/auth/application/ports/password-hasher.port.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { AuthSessionMetadata } from '@/modules/auth/domain/types/auth-session-metadata.type.js';
import { PasswordPolicy } from '@/modules/auth/domain/policies/password.policy.js';
import { RegistrationProfile } from '@/modules/auth/domain/entities/registration-profile.entity.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';
import { SendEmailVerificationService } from '@/modules/auth/application/services/send-email-verification.service.js';
import type {
  AuthRateLimitInput,
  AuthRateLimiter,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';

export type RegisterContext = {
  rateLimit: AuthRateLimitInput;
  sessionMetadata?: AuthSessionMetadata;
};

@Injectable()
export class RegisterService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    @Inject(AUTH_RATE_LIMITER)
    private readonly authRateLimiter: AuthRateLimiter,

    private readonly deviceSessionService: DeviceSessionService,
    private readonly sendEmailVerificationService: SendEmailVerificationService,
  ) {}

  async execute(
    input: {
      fullName: string;
      email: string;
      password: string;
      username?: string;
    },
    context: RegisterContext,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const profile = RegistrationProfile.create(input);
    await this.authRateLimiter.assertAllowed({
      ...context.rateLimit,
      subject: profile.email,
    });

    const sessionMetadata = context.sessionMetadata ?? {};
    const account = await this.authAccountRepository.findByEmail(profile.email);

    if (account) {
      throw new DomainError(
        ErrorCode.USER_ALREADY_EXISTS,
        'User already exists',
        409,
        { email: profile.email },
      );
    }

    PasswordPolicy.assertStrong(input.password);
    const passwordHash = await this.passwordHasher.hash(input.password);

    try {
      const result = await this.uow.execute(async () => {
        const newAccount = await this.authAccountRepository.register({
          email: profile.email,
          passwordHash,
          role: UserRole.USER,
        });

        await this.userRepository.create({
          id: newAccount.id,
          fullName: profile.fullName,
          username: profile.username,
        });

        const payload = JwtPayload.fromAuthAccount(newAccount, {
          fullName: profile.fullName,
          username: profile.username,
        });
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        const refreshTokenExpiresAt =
          this.tokenService.getRefreshTokenExpiresAt();

        await this.deviceSessionService.replaceActiveSessionForDevice({
          authAccountId: newAccount.id,
          sessionMetadata,
          reason: 'REPLACED_BY_REGISTER',
        });

        await this.sessionRepository.create({
          authAccountId: newAccount.id,
          refreshTokenHash: this.tokenHasher.hash(refreshToken),
          expiresAt: refreshTokenExpiresAt,
          ...sessionMetadata,
        });

        return {
          authAccountId: newAccount.id,
          accessToken,
          refreshToken,
          refreshTokenExpiresAt,
        };
      });

      await this.sendEmailVerificationService.executeSilently(
        result.authAccountId,
      );

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        refreshTokenExpiresAt: result.refreshTokenExpiresAt,
      };
    } catch (error) {
      if (this.isDuplicateField(error, 'email')) {
        throw new DomainError(
          ErrorCode.USER_ALREADY_EXISTS,
          'User already exists',
          409,
          { email: profile.email },
        );
      }

      if (this.isDuplicateField(error, 'username')) {
        throw new DomainError(
          ErrorCode.USERNAME_ALREADY_EXISTS,
          'Username already exists',
          409,
          { username: profile.username },
        );
      }

      throw error;
    }
  }

  private isDuplicateField(error: unknown, field: string): boolean {
    if (
      !(error instanceof DatabaseError) ||
      error.code !== ErrorCode.DUPLICATE_FIELD
    ) {
      return false;
    }

    const metadata = error.metadata as
      | {
          target?: unknown;
          meta?: {
            target?: unknown;
          };
        }
      | undefined;
    const target = metadata?.meta?.target ?? metadata?.target;

    if (Array.isArray(target)) {
      return target.includes(field);
    }

    return typeof target === 'string' && target.includes(field);
  }
}
