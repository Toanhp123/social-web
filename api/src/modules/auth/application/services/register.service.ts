import { Inject, Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import bcrypt from 'bcrypt';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';
import { User } from './../../../users/domain/entities/user.entity.js';
import { UserRole } from './../../../../generated/prisma/enums.js';
import { PrismaUserRepository } from './../../../users/infrastructure/persistence/prisma-user.repository.js';
import { USER_REPOSITORY } from './../../../../common/constants/repo.constant.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';
import { ErrorCode } from './../../../../../dist/src/core/exceptions/error-codes.js';

@Injectable()
export class RegisterService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: PrismaUserRepository,
  ) {}

  async execute(input: {
    fullName: string;
    email: string;
    password: string;
    username?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findAuthByEmail(input.email);

    if (user) {
      throw new DomainError(
        ErrorCode.USER_ALREADY_EXISTS,
        'User already exists',
        409,
        { email: input.email },
      );
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await this.authRepository.register(
      User.create(
        input.fullName,
        input.email,
        hashedPassword,
        UserRole.USER,
        input.username || '',
      ),
    );

    const payload = JwtPayload.fromAuthUser(newUser);
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
