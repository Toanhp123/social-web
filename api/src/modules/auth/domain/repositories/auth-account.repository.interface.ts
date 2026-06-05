import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import type {
  LinkOAuthAccountInput,
  OAuthAccountLookupInput,
  RegisterAuthAccountInput,
} from '@/modules/auth/domain/types/auth-account-input.type.js';

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
  abstract updatePassword(input: {
    authAccountId: string;
    passwordHash: string;
    passwordChangedAt: Date;
  }): Promise<AuthAccount>;
}
