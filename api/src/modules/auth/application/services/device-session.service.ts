import { Inject, Injectable } from '@nestjs/common';
import { SESSION_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import type { AuthSessionMetadata } from '@/modules/auth/domain/types/auth-session-metadata.type.js';
import type { SessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface.js';

export type ReplaceDeviceSessionReason =
  | 'REPLACED_BY_LOGIN'
  | 'REPLACED_BY_REGISTER'
  | 'REPLACED_BY_OAUTH';

@Injectable()
export class DeviceSessionService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async replaceActiveSessionForDevice(input: {
    authAccountId: string;
    sessionMetadata: AuthSessionMetadata;
    reason: ReplaceDeviceSessionReason;
  }): Promise<void> {
    const deviceId = input.sessionMetadata.deviceId;

    if (!deviceId) {
      return;
    }

    await this.sessionRepository.revokeActiveByDevice({
      authAccountId: input.authAccountId,
      deviceId,
      reason: input.reason,
    });
  }
}
