export type EmailVerificationToken = {
  id: string;
  authAccountId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type CreateEmailVerificationTokenInput = {
  authAccountId: string;
  tokenHash: string;
  expiresAt: Date;
};

export abstract class EmailVerificationTokenRepository {
  abstract create(
    input: CreateEmailVerificationTokenInput,
  ): Promise<EmailVerificationToken>;

  abstract markUnusedByAuthAccountUsed(input: {
    authAccountId: string;
    usedAt: Date;
  }): Promise<void>;

  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null>;

  abstract markUsed(input: {
    id: string;
    usedAt: Date;
  }): Promise<EmailVerificationToken>;
}
