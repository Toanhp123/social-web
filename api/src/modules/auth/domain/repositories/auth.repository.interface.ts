import { AuthUser } from '../entities/auth-user.entity.js';

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract register(user: AuthUser): Promise<AuthUser>;
}
