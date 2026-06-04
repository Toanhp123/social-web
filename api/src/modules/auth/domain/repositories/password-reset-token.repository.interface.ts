export type PasswordResetToken = {
  id: string;
  authAccountId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type CreatePasswordResetTokenInput = {
  authAccountId: string;
  tokenHash: string;
  expiresAt: Date;
};

export abstract class PasswordResetTokenRepository {
  abstract create(
    input: CreatePasswordResetTokenInput,
  ): Promise<PasswordResetToken>;

  abstract markUnusedByAuthAccountUsed(input: {
    authAccountId: string;
    usedAt: Date;
  }): Promise<void>;

  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null>;

  abstract markUsed(input: {
    id: string;
    usedAt: Date;
  }): Promise<PasswordResetToken>;
}
