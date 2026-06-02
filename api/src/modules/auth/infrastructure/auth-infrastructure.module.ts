import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthPersistenceModule } from '@/modules/auth/infrastructure/persistence/auth-persistence.module.js';
import { AuthRateLimitModule } from '@/modules/auth/infrastructure/rate-limiting/auth-rate-limit.module.js';
import { AuthSecurityModule } from '@/modules/auth/infrastructure/services/auth-security.module.js';
import { JwtStrategy } from '@/modules/auth/infrastructure/strategies/jwt.strategy.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    AuthPersistenceModule,
    AuthRateLimitModule,
    AuthSecurityModule,
  ],
  providers: [JwtStrategy],
  exports: [AuthPersistenceModule, AuthRateLimitModule, AuthSecurityModule],
})
export class AuthInfrastructureModule {}
