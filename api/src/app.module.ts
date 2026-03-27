import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './infrastructure/database/prisma.service.js';
import { UserModule } from './modules/users/user.module.js';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  validationSchema,
} from './infrastructure/config/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema,
    }),
    UserModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
