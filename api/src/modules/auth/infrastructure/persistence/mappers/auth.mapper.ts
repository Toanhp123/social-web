import { Prisma } from '../../../../../generated/prisma/client.js';
import { AuthUser } from './../../../../users/domain/entities/auth-user.entity.js';

type AuthPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    password: true;
    role: true;
  };
}>;

export class AuthMapper {
  static toDomain(prismaUser: AuthPayload): AuthUser {
    return new AuthUser(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.role,
    );
  }
}
