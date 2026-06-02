import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { UserModule } from '@/modules/users/user.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  validationSchema,
} from '@/infrastructure/config/index.js';
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filter.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import { RequestContextMiddleware } from '@/core/middleware/request-context.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validationSchema,
    }),

    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
