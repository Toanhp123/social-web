import { Prisma } from '@/generated/prisma/client.js';
import type { UserRole as PrismaUserRole } from '@/generated/prisma/enums.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { AuthAccount } from '@/modules/auth/domain/entities/auth-account.entity.js';
import { RegisterAuthAccountInput } from '@/modules/auth/domain/types/auth-account-input.type.js';

export const AUTH_ACCOUNT_SELECT = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  emailVerifiedAt: true,
  passwordChangedAt: true,
  disabledAt: true,
} as const;

type AuthAccountPayload = Prisma.AuthAccountGetPayload<{
  select: typeof AUTH_ACCOUNT_SELECT;
}>;

export class AuthAccountMapper {
  static select = AUTH_ACCOUNT_SELECT;

  static toPersistence(
    input: RegisterAuthAccountInput,
    accountId: string,
  ): Prisma.AuthAccountCreateInput {
    return {
      id: accountId,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role as PrismaUserRole,
      emailVerifiedAt: input.emailVerifiedAt,
    };
  }

  static toDomain(prismaUser: AuthAccountPayload): AuthAccount {
    return new AuthAccount(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.role as UserRole,
      prismaUser.emailVerifiedAt,
      prismaUser.passwordChangedAt,
      prismaUser.disabledAt,
    );
  }
}
