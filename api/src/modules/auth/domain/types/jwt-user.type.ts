import { UserRole } from './../../../../generated/prisma/enums.js';

export type JwtUser = {
  userId: string;
  email: string;
  role: UserRole;
};
