import { AuthUser } from '../entities/auth-user.entity.js';

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract create(user: AuthUser): Promise<AuthUser>;
  // abstract updatePassword(...): ...
}
