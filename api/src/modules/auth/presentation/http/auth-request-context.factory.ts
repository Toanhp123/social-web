import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type {
  AuthRateLimitAction,
  AuthRateLimitInput,
} from '@/modules/auth/application/ports/auth-rate-limiter.port.js';
import type { AuthSessionMetadata } from '@/modules/auth/application/types/auth-session-metadata.type.js';

@Injectable()
export class AuthRequestContextFactory {
  createSessionMetadata(req: Request): AuthSessionMetadata {
    const deviceId = this.getDeviceId(req);
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
    return req.ip ?? req.socket.remoteAddress;
  }

  private getDeviceId(req: Request): string | undefined {
    return req.header('x-device-id')?.trim() || undefined;
  }
}
