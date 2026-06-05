import { UserRole } from '@/core/security/enums/user-role.enum.js';
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
