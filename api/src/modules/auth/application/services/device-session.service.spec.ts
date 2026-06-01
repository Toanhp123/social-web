import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DeviceSessionService } from '@/modules/auth/application/services/device-session.service.js';
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';

describe('DeviceSessionService', () => {
  let sessionRepository: jest.Mocked<SessionRepository>;
  let service: DeviceSessionService;

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      revokeActiveByDevice: jest.fn(),
      revokeActiveByAuthAccount: jest.fn(),
      findByRefreshTokenHash: jest.fn(),
      findByRotatedRefreshTokenHash: jest.fn(),
      rotateRefreshToken: jest.fn(),
      revokeByRefreshTokenHash: jest.fn(),
    };

    service = new DeviceSessionService(sessionRepository);
  });

  it('revokes an active session for the same device', async () => {
    await service.replaceActiveSessionForDevice({
      authAccountId: 'user-1',
      sessionMetadata: {
        deviceId: 'device-1',
      },
      reason: 'REPLACED_BY_LOGIN',
    });

    expect(sessionRepository.revokeActiveByDevice).toHaveBeenCalledWith({
      authAccountId: 'user-1',
      deviceId: 'device-1',
      reason: 'REPLACED_BY_LOGIN',
    });
  });

  it('does nothing when device id is missing', async () => {
    await service.replaceActiveSessionForDevice({
      authAccountId: 'user-1',
      sessionMetadata: {},
      reason: 'REPLACED_BY_REGISTER',
    });

    expect(sessionRepository.revokeActiveByDevice).not.toHaveBeenCalled();
  });
});
