import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { UserModule } from '@/modules/users/user.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import {
  appConfig,
  cloudinaryConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  validationSchema,
} from '@/infrastructure/config/index.js';
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filter.js';
import { LoggerService } from '@/core/logger/logger.service.js';
import { RequestContextMiddleware } from '@/core/middleware/request-context.middleware.js';
import { RateLimitGuard } from '@/core/rate-limiting/guards/rate-limit.guard.js';
import { RateLimitingModule } from '@/infrastructure/rate-limiting/rate-limiting.module.js';
import { CoreHttpModule } from '@/core/http/core-http.module.js';
import { CloudinaryModule } from '@/infrastructure/storage/cloudinary/cloudinary.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        cloudinaryConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
      ],
      validationSchema,
    }),

    UserModule,
    AuthModule,
    CoreHttpModule,
    CloudinaryModule,
    RateLimitingModule,
  ],
  controllers: [],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
