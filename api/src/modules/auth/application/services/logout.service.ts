import { Inject, Injectable } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  TOKEN_HASHER,
} from '@/common/constants/provider-token.constant.js';
import type { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';

@Injectable()
export class LogoutService {
  constructor(
    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.sessionRepository.revokeByRefreshTokenHash(
      this.tokenHasher.hash(refreshToken),
      'LOGOUT',
    );
  }
}
