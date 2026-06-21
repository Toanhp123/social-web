import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/modules/auth/domain/value-objects/jwt-payload.js';
import { AUTH_ACCOUNT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { AuthAccountRepository } from '@/modules/auth/domain/repositories/auth-account.repository.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,

    @Inject(AUTH_ACCOUNT_REPOSITORY)
    private authAccountRepository: AuthAccountRepository,
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

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const account = await this.authAccountRepository.findById(payload.id);

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    if (account.isDisabled()) {
      throw new UnauthorizedException('Account disabled');
    }

    return {
      userId: account.id,
      email: account.email,
      fullName: account.fullName,
      username: account.username,
      role: account.role,
    };
  }
}
