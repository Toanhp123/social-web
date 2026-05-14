import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { TokenHasher } from '@/modules/auth/application/ports/token-hasher.port.js';

@Injectable()
export class Sha256TokenHasher implements TokenHasher {
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
