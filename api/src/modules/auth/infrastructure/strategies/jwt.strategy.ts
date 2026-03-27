import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../domain/repositories/auth.repository.interface.js';
import { JwtPayload } from '../../domain/value-objects/jwt-payload.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {
    const secret = configService.get<string>('jwt.accessSecret');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // ← Đảm bảo là string
    });
  }

  async validate(payload: JwtPayload) {
    // Nên dùng findById thay vì findByEmail để hiệu suất tốt hơn
    const user = await this.authRepository.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Trả về thông tin bạn muốn attach vào req.user
    return {
      userId: payload.sub,
      email: payload.email,
      // name: payload.name, // nếu có
    };
  }
}
