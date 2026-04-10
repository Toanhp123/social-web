import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import { JwtUser } from '../../domain/types/jwt-user.type.js';
import { JwtPayload } from '../../domain/object-values/jwt-payload.js';
import { PrismaUserRepository } from './../../../users/infrastructure/persistence/prisma-user.repository.js';
import { USER_REPOSITORY } from './../../../../common/constants/repo.constant.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authRepository: AuthRepository,

    @Inject(USER_REPOSITORY)
    private userRepository: PrismaUserRepository,
  ) {
    const secret = configService.get<string>('jwt.accessSecret');

    if (!secret) {
      throw new InternalServerErrorException(
        'Missing config: jwt.accessSecret',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}
