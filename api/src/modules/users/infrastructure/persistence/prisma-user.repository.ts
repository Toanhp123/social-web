import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { UserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserMapper } from './mappers/user.mapper.js';
import { mapPrismaError } from '../../../../core/mappers/prisma-error.mapper.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          username: true,
          authAccount: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      });

      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
