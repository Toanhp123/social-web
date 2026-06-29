import { UserRole } from '@/core/security/enums/user-role.enum.js';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  fullName: string | null;
  username: string | null;
  role: UserRole;
};
