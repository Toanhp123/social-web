import { AuthUser } from '../entities/auth-user.entity.js';

export class JwtPayload {
  constructor(
    public readonly sub: string,
    public readonly email: string,
  ) {}

  static fromAuthUser(user: AuthUser): JwtPayload {
    return new JwtPayload(user.id, user.email);
  }
}
