import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { RedisService } from '@/infrastructure/redis/redis.service.js';
import {
  OAuthSessionHandoffPayload,
  OAuthSessionHandoffStore,
} from '@/modules/auth/application/ports/oauth-session-handoff-store.port.js';

const HANDOFF_CODE_TTL_SECONDS = 60;
const HANDOFF_KEY_PREFIX = 'auth:oauth-session:';

type StoredOAuthSessionHandoff = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

@Injectable()
export class RedisOAuthSessionHandoffStore implements OAuthSessionHandoffStore {
  constructor(private readonly redis: RedisService) {}

  async create(payload: OAuthSessionHandoffPayload): Promise<string> {
    const code = randomBytes(32).toString('base64url');
    const storedPayload: StoredOAuthSessionHandoff = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      refreshTokenExpiresAt: payload.refreshTokenExpiresAt.toISOString(),
    };

    await this.redis
      .getClient()
      .set(
        this.getKey(code),
        JSON.stringify(storedPayload),
        'EX',
        HANDOFF_CODE_TTL_SECONDS,
      );

    return code;
  }

  async consume(code: string): Promise<OAuthSessionHandoffPayload | null> {
    const value = await this.redis
      .getClient()
      .call('GETDEL', this.getKey(code));

    if (typeof value !== 'string') {
      return null;
    }

    return this.parse(value);
  }

  private parse(value: string): OAuthSessionHandoffPayload | null {
    try {
      const parsed = JSON.parse(value) as Partial<StoredOAuthSessionHandoff>;

      if (
        typeof parsed.accessToken !== 'string' ||
        typeof parsed.refreshToken !== 'string' ||
        typeof parsed.refreshTokenExpiresAt !== 'string'
      ) {
        return null;
      }

      const refreshTokenExpiresAt = new Date(parsed.refreshTokenExpiresAt);

      if (Number.isNaN(refreshTokenExpiresAt.getTime())) {
        return null;
      }

      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        refreshTokenExpiresAt,
      };
    } catch {
      return null;
    }
  }

  private getKey(code: string): string {
    return `${HANDOFF_KEY_PREFIX}${code}`;
  }
}
