import bcrypt from 'bcrypt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from './../../../../common/constants/repo.constant.js';

@Injectable()
export class LoginService {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, password: string) {
    const user = await this.userRepository.findById(id);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = JwtPayload.fromAuthUser(user);
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
