import bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface.js';
import { USER_REPOSITORY } from './../../../../common/constants/repo.constant.js';
import { ErrorCode } from '../../../../core/exceptions/error-codes.js';
import { DomainError } from './../../../../core/exceptions/domain.exception.js';

@Injectable()
export class LoginService {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findAuthByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new DomainError(
        ErrorCode.INVALID_CREDENTIALS,
        'Email or password is incorrect',
        409,
        { email, password },
      );
    }

    const payload = JwtPayload.fromAuthUser(user);
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
