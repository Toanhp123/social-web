import { AuthUser } from '../entities/auth-user.entity.js';
import { User } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findAuthByEmail(email: string): Promise<AuthUser | null>;
}
