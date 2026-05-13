import { describe, expect, it } from '@jest/globals';
import { DomainError } from '../exceptions/domain.exception.js';
import { ErrorCode } from '../exceptions/error-codes.js';
import { EmailAddress } from './email-address.js';

describe('EmailAddress', () => {
  it('normalizes email casing and whitespace', () => {
    expect(EmailAddress.normalize(' USER@example.COM ')).toBe(
      'user@example.com',
    );
  });

  it('validates normalized email addresses', () => {
    expect(EmailAddress.normalizeAndValidate(' USER@example.COM ')).toBe(
      'user@example.com',
    );
  });

  it('throws for invalid email addresses', () => {
    expect(() => EmailAddress.normalizeAndValidate('invalid-email')).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_EMAIL,
        statusCode: 400,
      }),
    );
  });
});
