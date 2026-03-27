import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import bcrypt from 'bcrypt';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';
import { JwtService } from '../../infrastructure/services/jwt.service.js';

@Injectable()
export class LoginService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = JwtPayload.fromAuthUser(user);
    const accessToken = this.jwtService.generateAccessToken(payload);

    return { accessToken };
  }
}
