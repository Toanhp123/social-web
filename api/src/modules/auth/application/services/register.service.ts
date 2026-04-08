import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import bcrypt from 'bcrypt';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';
import { AuthUser } from '../../domain/entities/auth-user.entity.js';

@Injectable()
export class RegisterService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async execute(input: {
    fullName: string;
    email: string;
    password: string;
    username?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(input.email);

    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = await this.authRepository.register(
      AuthUser.create(
        input.fullName,
        input.email,
        hashedPassword,
        input.username,
      ),
    );

    const payload = JwtPayload.fromAuthUser(newUser);
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
