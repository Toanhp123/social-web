import { DatabaseTransaction } from '../../../../core/databases/unit-of-work.interface.js';
import { UserRole } from '../../../../core/security/enums/user-role.enum.js';
import { AuthAccount } from '../entities/auth-account.entity.js';

export type RegisterAuthAccountInput = {
  fullName: string;
  email: string;
  username: string | null;
  passwordHash: string;
  role: UserRole;
};

export abstract class AuthAccountRepository {
  abstract findById(id: string): Promise<AuthAccount | null>;
  abstract findByEmail(email: string): Promise<AuthAccount | null>;
  abstract register(
    input: RegisterAuthAccountInput,
    tx: DatabaseTransaction,
  ): Promise<AuthAccount>;
}
