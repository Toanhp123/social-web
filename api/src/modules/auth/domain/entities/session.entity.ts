export class Session {
  constructor(
    public readonly id: string,
    public readonly authAccountId: string,
    public readonly refreshTokenHash: string,
    public readonly isRevoked: boolean,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly lastUsedAt: Date | null,
  ) {}

  isExpired(now = new Date()): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  isActive(now = new Date()): boolean {
    return !this.isRevoked && !this.isExpired(now);
  }
}
