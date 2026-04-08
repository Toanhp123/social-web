import { Prisma } from '../../../../../generated/prisma/client.js';

type AuthPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    fullName: true;
    role: UserRole;
  };
}>;

export class UserMapper {
  static toDomain(prismaUser: UserPayload): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.username);
  }
}
