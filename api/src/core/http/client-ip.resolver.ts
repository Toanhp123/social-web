import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ClientIpResolver {
  resolve(request: Request): string {
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
