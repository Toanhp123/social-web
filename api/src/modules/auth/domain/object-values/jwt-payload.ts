// src/auth/domain/value-objects/jwt-payload.ts
import { UserRole } from './../../../../generated/prisma/enums.js';
import { AuthUser } from './../../../users/domain/entities/auth-user.entity.js';

export class JwtPayload {
  id: string;
  email: string;
  role: UserRole;

  constructor(id: string, email: string, role: UserRole) {
    this.id = id;
    this.email = email;
    this.role = role;
  }

  static fromAuthUser(user: AuthUser): JwtPayload {
    return new JwtPayload(user.id, user.email, user.role);
  }
}
