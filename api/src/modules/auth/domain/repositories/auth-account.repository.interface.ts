import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { AuthAccount } from '../entities/auth-account.entity.js';

export type RegisterAuthAccountInput = {
  email: string;
  passwordHash: string;
  role: UserRole;
};

export abstract class AuthAccountRepository {
  abstract findById(id: string): Promise<AuthAccount | null>;
  abstract findByEmail(email: string): Promise<AuthAccount | null>;
  abstract register(input: RegisterAuthAccountInput): Promise<AuthAccount>;
}
