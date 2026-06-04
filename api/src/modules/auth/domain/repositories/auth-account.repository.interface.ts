import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import type { OAuthProvider } from '@/modules/auth/domain/value-objects/oauth-provider.js';

export type RegisterAuthAccountInput = {
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerifiedAt?: Date;
};

export type OAuthAccountLookupInput = {
  provider: OAuthProvider;
  providerId: string;
};

export type LinkOAuthAccountInput = OAuthAccountLookupInput & {
  authAccountId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export abstract class AuthAccountRepository {
  abstract findById(id: string): Promise<AuthAccount | null>;
  abstract findByEmail(email: string): Promise<AuthAccount | null>;
  abstract findByOAuthAccount(
    input: OAuthAccountLookupInput,
  ): Promise<AuthAccount | null>;
  abstract register(input: RegisterAuthAccountInput): Promise<AuthAccount>;
  abstract linkOAuthAccount(input: LinkOAuthAccountInput): Promise<void>;
  abstract markEmailVerified(input: {
    authAccountId: string;
    verifiedAt: Date;
  }): Promise<AuthAccount>;
}
