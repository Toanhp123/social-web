import { Session } from '@/modules/auth/domain/entities/session.entity.js';

export type CreateSessionInput = {
  authAccountId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  device?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
};

export abstract class SessionRepository {
  abstract create(input: CreateSessionInput): Promise<Session>;

  abstract revokeActiveByDevice(input: {
    authAccountId: string;
    deviceId: string;
    reason: string;
  }): Promise<void>;

  abstract revokeActiveByAuthAccount(input: {
    authAccountId: string;
    reason: string;
  }): Promise<void>;

  abstract findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<Session | null>;

  abstract findByRotatedRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<Session | null>;

  abstract rotateRefreshToken(input: {
    sessionId: string;
    currentRefreshTokenHash: string;
    currentRefreshTokenExpiresAt: Date;
    nextRefreshTokenHash: string;
    nextRefreshTokenExpiresAt: Date;
  }): Promise<boolean>;

  abstract revokeByRefreshTokenHash(
    refreshTokenHash: string,
    reason: string,
  ): Promise<void>;
}
