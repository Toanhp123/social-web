import { Prisma } from '../../../../../generated/prisma/client.js';
import { UserRole } from '../../../../../core/security/enums/user-role.enum.js';
import { User } from '../../../domain/entities/user.entity.js';

type UserPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    fullName: true;
    authAccount: {
      select: {
        email: true;
        role: true;
      };
    };
  };
}>;

export class UserMapper {
  static toDomain(prismaUser: UserPayload): User {
    return new User(
      prismaUser.id,
      prismaUser.fullName,
      prismaUser.authAccount.email,
      prismaUser.authAccount.role as UserRole,
      prismaUser.username,
    );
  }
}
