import {
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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authRepository: AuthRepository,
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
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Nên dùng findById thay vì findByEmail để hiệu suất tốt hơn
    const user = await this.authRepository.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
