import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/core/logger/logger.service.js';
import type { NestExpressApplication } from '@nestjs/platform-express';

type TrustProxyConfig = boolean | number | string;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const corsOrigins = config.get<string[]>('app.corsOrigins') ?? [];
  const isProduction = config.get<string>('app.env') === 'production';
  const trustProxy = config.get<TrustProxyConfig>('app.trustProxy') ?? false;

  app.useLogger(logger);
  if (trustProxy !== false) {
    app.set('trust proxy', trustProxy);
  }
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : !isProduction,
    credentials: true,
  });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(config.get<number>('app.port') ?? 3001);
}
void bootstrap();
