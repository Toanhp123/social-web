import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import { User } from './../../../users/domain/entities/user.entity.js';
import { AuthMapper } from './mappers/auth.mapper.js';
import { AuthUser } from './../../../users/domain/entities/auth-user.entity.js';
import { Prisma } from '../../../../generated/prisma/client.js';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  async register(user: User, tx: Prisma.TransactionClient): Promise<AuthUser> {
    const createdUser = await tx.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        username: user.username,
        role: user.role,
      },
    });

    return AuthMapper.toDomain(createdUser);
  }
}
