import { Prisma } from '../../../../generated/prisma/client.js';
import { AuthUser } from './../../../users/domain/entities/auth-user.entity.js';
import { User } from './../../../users/domain/entities/user.entity.js';

export abstract class AuthRepository {
  abstract register(
    user: User,
    tx: Prisma.TransactionClient,
  ): Promise<AuthUser>;
}
