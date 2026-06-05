import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type {
  AuthRateLimitAction,
  AuthRateLimitInput,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import type { AuthSessionMetadata } from '@/modules/auth/domain/types/auth-session-metadata.type.js';
import { ClientIpResolver } from '@/core/http/client-ip.resolver.js';

@Injectable()
export class AuthRequestContextFactory {
  constructor(private readonly clientIpResolver: ClientIpResolver) {}

  createSessionMetadata(
    req: Request,
    options: { deviceId?: string } = {},
  ): AuthSessionMetadata {
    const deviceId = options.deviceId ?? this.getDeviceId(req);
    const device = req.header('x-device-name')?.trim();

    return {
      ip: this.getClientIp(req),
      userAgent: req.header('user-agent'),
      ...(deviceId ? { deviceId } : {}),
      ...(device ? { device } : {}),
    };
  }

  createRateLimitInput(
    req: Request,
    action: AuthRateLimitAction,
    subject?: string,
  ): AuthRateLimitInput {
    return {
      action,
      ip: this.getClientIp(req),
      subject,
      deviceId: this.getDeviceId(req),
    };
  }

  private getClientIp(req: Request): string | undefined {
    return this.clientIpResolver.resolve(req);
  }

  private getDeviceId(req: Request): string | undefined {
    return req.header('x-device-id')?.trim() || undefined;
  }
}
