import { Prisma } from '../../../../../generated/prisma/client.js';
import { AuthUser } from './../../../domain/entities/auth-user.entity.js';

type AuthUserPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    role: true;
  };
}>;

export class AuthUserMapper {
  static toDomain(prismaUser: AuthUserPayload): AuthUser {
    return new AuthUser(prismaUser.id, prismaUser.email, prismaUser.role);
  }
}
