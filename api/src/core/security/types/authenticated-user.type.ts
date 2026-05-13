import { UserRole } from '../enums/user-role.enum.js';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: UserRole;
};
