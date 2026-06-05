export type CreateSessionInput = {
  authAccountId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  device?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
};
