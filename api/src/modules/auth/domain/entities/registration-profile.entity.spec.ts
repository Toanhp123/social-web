import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { RegistrationProfile } from '@/modules/auth/domain/entities/registration-profile.entity.js';

describe('RegistrationProfile', () => {
  it('creates a normalized registration profile', () => {
    const profile = RegistrationProfile.create({
      fullName: '  Example User  ',
      email: ' User@Example.COM ',
      username: '  exampleuser  ',
    });

    expect(profile).toMatchObject({
      fullName: 'Example User',
      email: 'user@example.com',
      username: 'exampleuser',
    });
  });

  it('normalizes empty username to null', () => {
    const profile = RegistrationProfile.create({
      fullName: 'Example User',
      email: 'user@example.com',
      username: '   ',
    });

    expect(profile.username).toBeNull();
  });

  it('rejects invalid full names', () => {
    expect(() =>
      RegistrationProfile.create({ fullName: 'abc', email: 'user@example.com' }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_FULLNAME,
      }),
    );
  });

  it('rejects invalid usernames', () => {
    expect(() =>
      RegistrationProfile.create({
        fullName: 'Example User',
        email: 'user@example.com',
        username: 'abc',
      }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.INVALID_USERNAME,
      }),
    );
  });
});
