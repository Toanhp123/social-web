import { Prisma } from '../../../../../generated/prisma/client.js';
import { User } from '../../../domain/entities/user.entity.js';

type UserPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
  };
}>;

export class UserMapper {
  static toDomain(prismaUser: UserPayload): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name);
  }
}
