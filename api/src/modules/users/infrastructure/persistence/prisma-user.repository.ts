import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { UserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserMapper } from './mappers/user.mapper.js';
import { AuthUser } from '../../domain/entities/auth-user.entity.js';
import { AuthUserMapper } from './mappers/auth-user.mapper.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findAuthByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user ? AuthUserMapper.toDomain(user) : null;
  }
}
