import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';
import { LogoutService } from '@/modules/auth/application/services/logout.service.js';

describe('LogoutService', () => {
  let tokenHasher: jest.Mocked<TokenHasher>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let service: LogoutService;

  beforeEach(() => {
    tokenHasher = {
      hash: jest.fn().mockReturnValue('refresh-token-hash'),
    };

    sessionRepository = {
      create: jest.fn(),
      revokeActiveByDevice: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    service = new LogoutService(tokenHasher, sessionRepository);
  });

  it('revokes the current refresh token session', async () => {
    await service.execute('refresh-token');

    expect(sessionRepository.revokeByRefreshTokenHash).toHaveBeenCalledWith(
      'refresh-token-hash',
      'LOGOUT',
    );
  });

  it('does nothing when refresh token is missing', async () => {
    await service.execute(undefined);

    expect(sessionRepository.revokeByRefreshTokenHash).not.toHaveBeenCalled();
  });
});
