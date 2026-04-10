import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { AuthRepository } from './domain/repositories/auth.repository.interface.js';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository.js';
import { LoginService } from './application/services/login.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './infrastructure/services/jwt.service.js';
import { UserModule } from '../users/user.module.js';
import { RegisterService } from './application/services/register.service.js';
import { PrismaUnitOfWork } from './../../infrastructure/database/prisma-unit-of-work.js';
import { UNIT_OF_WORK } from './../../common/constants/repo.constant.js';
import { RefreshTokenService } from './application/services/refresh-token.service.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    LoginService,
    RegisterService,
    RefreshTokenService,
    {
      provide: UNIT_OF_WORK,
      useClass: PrismaUnitOfWork,
    },
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
    JwtService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
