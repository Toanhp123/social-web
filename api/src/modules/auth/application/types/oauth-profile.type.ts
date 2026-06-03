import type { OAuthProvider } from '@/modules/auth/domain/value-objects/oauth-provider.js';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatarUrl?: string;
};
