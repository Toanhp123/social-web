import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import {
  AUTH_ACCOUNT_REPOSITORY,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_HASHER,
  TOKEN_SERVICE,
  UNIT_OF_WORK,
} from './../../../../common/constants/provider-token.constant.js';
import { DatabaseError } from '../../../../core/exceptions/database.exception.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import type { UnitOfWork } from './../../../../core/databases/unit-of-work.interface.js';
import type { TokenService } from '../../application/ports/token-service.port.js';
import type { PasswordHasher } from '../../application/ports/password-hasher.port.js';
import type { TokenHasher } from '../ports/token-hasher.port.js';
import { AuthSessionMetadata } from '../types/auth-session-metadata.type.js';
import { PasswordPolicy } from '../../domain/policies/password.policy.js';
import { RegistrationProfilePolicy } from '../../domain/policies/registration-profile.policy.js';
import { AuthAccountRepository } from '../../domain/repositories/auth-account.repository.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.interface.js';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private readonly authAccountRepository: AuthAccountRepository,

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
  ) {}

  async execute(
    input: {
      fullName: string;
      email: string;
      password: string;
      username?: string;
    },
    sessionMetadata: AuthSessionMetadata = {},
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const profile = RegistrationProfilePolicy.normalize(input);
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
      return await this.uow.execute(async (tx) => {
        const newAccount = await this.authAccountRepository.register(
          {
            fullName: profile.fullName,
            email: profile.email,
            username: profile.username,
            passwordHash,
            role: UserRole.USER,
          },
          tx,
        );

        const payload = JwtPayload.fromAuthAccount(newAccount);
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        const refreshTokenExpiresAt =
          this.tokenService.getRefreshTokenExpiresAt();

        await this.sessionRepository.create(
          {
            authAccountId: newAccount.id,
            refreshTokenHash: this.tokenHasher.hash(refreshToken),
            expiresAt: refreshTokenExpiresAt,
            ...sessionMetadata,
          },
          tx,
        );

        return { accessToken, refreshToken, refreshTokenExpiresAt };
      });
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
