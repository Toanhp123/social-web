import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  PASSWORD_HASHER,
  TOKEN_HASHER,
  TOKEN_SERVICE,
} from '@/common/constants/provider-token.constant.js';
import { BcryptPasswordHasher } from '@/modules/auth/infrastructure/services/bcrypt-password-hasher.service.js';
import { JwtService } from '@/modules/auth/infrastructure/services/jwt.service.js';
import { Sha256TokenHasher } from '@/modules/auth/infrastructure/services/sha256-token-hasher.service.js';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [
    {
      provide: TOKEN_SERVICE,
      useClass: JwtService,
    },
    {
      provide: TOKEN_HASHER,
      useClass: Sha256TokenHasher,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [TOKEN_SERVICE, TOKEN_HASHER, PASSWORD_HASHER],
})
export class AuthSecurityModule {}
