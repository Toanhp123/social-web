import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import { PrismaService } from './../../../../infrastructure/database/prisma.service.js';
import { AuthUser } from '../../domain/entities/auth-user.entity.js';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    return null;
  }

  async register(user: AuthUser): Promise<AuthUser> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        username: user.username,
        role: user.role,
      },
    });

    return createdUser;
  }
}
