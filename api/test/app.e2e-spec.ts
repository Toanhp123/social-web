import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { jest } from '@jest/globals';
import cookieParser from 'cookie-parser';

type HttpResponseWithHeaders = {
  headers: Record<string, string | string[] | undefined>;
};

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let registerService: { execute: jest.Mock };
  let loginService: { execute: jest.Mock };
  let refreshTokenService: { execute: jest.Mock };
  let logoutService: { execute: jest.Mock };
  let authRateLimiter: { assertAllowed: jest.Mock };
  const refreshTokenExpiresAt = new Date('2030-01-01T00:00:00.000Z');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_ACCESS_TOKEN_SECRET ??= 'test-access-secret';
    process.env.JWT_REFRESH_TOKEN_SECRET ??= 'test-refresh-secret';

    const { AppModule } = await import('../src/app.module.js');
    const { PrismaService } =
      await import('../src/infrastructure/database/prisma.service.js');
    const { LoggerService } =
      await import('../src/core/logger/logger.service.js');
    const { RegisterService } =
      await import('../src/modules/auth/application/services/register.service.js');
    const { LoginService } =
      await import('../src/modules/auth/application/services/login.service.js');
    const { RefreshTokenService } =
      await import('../src/modules/auth/application/services/refresh-token.service.js');
    const { LogoutService } =
      await import('../src/modules/auth/application/services/logout.service.js');
    const { AUTH_RATE_LIMITER } =
      await import('../src/common/constants/provider-token.constant.js');

    registerService = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'register-access-token',
        refreshToken: 'register-refresh-token',
        refreshTokenExpiresAt,
      }),
    };
    loginService = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'login-access-token',
        refreshToken: 'login-refresh-token',
        refreshTokenExpiresAt,
      }),
    };
    refreshTokenService = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'refreshed-access-token',
        refreshToken: 'rotated-refresh-token',
        refreshTokenExpiresAt,
      }),
    };
    logoutService = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    authRateLimiter = {
      assertAllowed: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .overrideProvider(LoggerService)
      .useValue({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
        fatal: jest.fn(),
      })
      .overrideProvider(RegisterService)
      .useValue(registerService)
      .overrideProvider(LoginService)
      .useValue(loginService)
      .overrideProvider(RefreshTokenService)
      .useValue(refreshTokenService)
      .overrideProvider(LogoutService)
      .useValue(logoutService)
      .overrideProvider(AUTH_RATE_LIMITER)
      .useValue(authRateLimiter)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns a request id for errors', async () => {
    await request(app.getHttpServer())
      .get('/missing')
      .expect(404)
      .expect((res) => {
        expect(res.headers['x-request-id']).toBeDefined();
        expect(res.body.requestId).toBeDefined();
      });
  });

  it('runs the auth HTTP flow and refresh cookie lifecycle', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .set('x-device-id', 'device-1')
      .send({
        fullName: 'Example User',
        email: 'USER@example.com',
        password: 'secret123',
        username: 'exampleuser',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({ accessToken: 'register-access-token' });
      });
    const registerCookie = getRefreshTokenCookie(registerResponse);

    expect(registerCookie).toBe('refreshToken=register-refresh-token');
    expect(authRateLimiter.assertAllowed).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'register',
        subject: 'USER@example.com',
        deviceId: 'device-1',
      }),
    );
    expect(registerService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'USER@example.com',
        username: 'exampleuser',
      }),
      expect.objectContaining({
        deviceId: 'device-1',
      }),
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'USER@example.com',
        password: 'secret123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ accessToken: 'login-access-token' });
      });
    const loginCookie = getRefreshTokenCookie(loginResponse);

    expect(loginCookie).toBe('refreshToken=login-refresh-token');
    expect(authRateLimiter.assertAllowed).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'login',
        subject: 'USER@example.com',
      }),
    );
    expect(loginService.execute).toHaveBeenCalledWith(
      'USER@example.com',
      'secret123',
      expect.any(Object),
    );

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', loginCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ accessToken: 'refreshed-access-token' });
      });
    const refreshCookie = getRefreshTokenCookie(refreshResponse);

    expect(refreshCookie).toBe('refreshToken=rotated-refresh-token');
    expect(authRateLimiter.assertAllowed).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'refresh',
      }),
    );
    expect(refreshTokenService.execute).toHaveBeenCalledWith(
      'login-refresh-token',
    );

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', refreshCookie)
      .expect(204)
      .expect((res) => {
        expect(getSetCookies(res)).toEqual(
          expect.arrayContaining([expect.stringContaining('refreshToken=;')]),
        );
      });

    expect(logoutService.execute).toHaveBeenCalledWith('rotated-refresh-token');
  });
});

function getRefreshTokenCookie(response: HttpResponseWithHeaders): string {
  const cookie = getSetCookies(response).find((value) =>
    value.startsWith('refreshToken='),
  );

  if (!cookie) {
    throw new Error('Missing refresh token cookie');
  }

  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('Path=/auth');
  expect(cookie).toContain('Expires=');

  return cookie.split(';')[0];
}

function getSetCookies(response: HttpResponseWithHeaders): string[] {
  const setCookie = response.headers['set-cookie'];

  if (!setCookie) {
    return [];
  }

  return Array.isArray(setCookie) ? setCookie : [setCookie];
}
