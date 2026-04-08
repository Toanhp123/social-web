// src/auth/domain/value-objects/jwt-payload.ts
import { AuthUser } from '../entities/auth-user.entity.js'; // entity của bạn

export class JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';

  constructor(sub: string, email: string, role: 'USER' | 'ADMIN') {
    this.sub = sub;
    this.email = email;
    this.role = role;
  }

  static fromAuthUser(user: AuthUser): JwtPayload {
    return new JwtPayload(user.id, user.email, user.role);
  }
}
