import { Prisma } from '@/generated/prisma/client.js';
import { UserRole } from '@/core/security/enums/user-role.enum.js';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';
import { CreateUserInput } from '@/modules/users/domain/types/create-user-input.type.js';

export const USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  authAccount: {
    select: {
      email: true,
      role: true,
    },
  },
} as const;

type UserPayload = Prisma.UserGetPayload<{
  select: typeof USER_SELECT;
}>;

export const USER_SUMMARY_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
} as const;

type UserSummaryPayload = Prisma.UserGetPayload<{
  select: typeof USER_SUMMARY_SELECT;
}>;

export class UserMapper {
  static select = USER_SELECT;
  static summarySelect = USER_SUMMARY_SELECT;

  static toPersistence(
    input: CreateUserInput,
  ): Prisma.UserUncheckedCreateInput {
    return input;
  }

  static toDomain(prismaUser: UserPayload): User {
    return new User(
      prismaUser.id,
      prismaUser.fullName,
      prismaUser.authAccount.email,
      prismaUser.authAccount.role as UserRole,
      prismaUser.username,
    );
  }

  static toSummaryDomain(prismaUser: UserSummaryPayload): UserSummary {
    return new UserSummary(
      prismaUser.id,
      prismaUser.fullName,
      prismaUser.username,
      prismaUser.avatarUrl,
    );
  }
}
