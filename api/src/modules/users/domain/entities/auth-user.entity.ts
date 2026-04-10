import { UserRole } from './../../../../generated/prisma/enums.js';

export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole,
  ) {}
}
