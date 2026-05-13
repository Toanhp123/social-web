import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../application/ports/password-hasher.port.js';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 10;

  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
