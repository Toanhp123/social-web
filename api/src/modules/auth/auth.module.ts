import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { AuthRepository } from './domain/repositories/auth.repository.interface.js';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository.js';
import { LoginService } from './application/services/login.service.js';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './infrastructure/services/jwt.service.js';

@Module({
  imports: [ConfigModule.forRoot(), PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    PrismaService,
    LoginService,
    JwtService,
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
