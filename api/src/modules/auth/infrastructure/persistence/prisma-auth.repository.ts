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

  async create(user: AuthUser): Promise<AuthUser> {
    return user;
  }
}
