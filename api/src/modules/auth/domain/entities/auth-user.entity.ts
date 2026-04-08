export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly username?: string,
    public readonly role: 'USER' | 'ADMIN' = 'USER',
  ) {}

  // Factory method để tạo mới
  static create(
    fullName: string,
    email: string,
    hashedPassword: string,
    username?: string,
  ): AuthUser {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!hashedPassword || hashedPassword.length < 8) {
      throw new Error('Password hash is invalid');
    }

    if (fullName && fullName.length < 12) {
      throw new Error('FullName must be at least 12 characters');
    }

    if (username && username.length < 6) {
      throw new Error('Username must be at least 6 characters');
    }

    return new AuthUser(
      '', // id sẽ được gán khi lưu vào database
      fullName.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      username?.trim(),
    );
  }

  isValidEmail(): boolean {
    return this.email.includes('@');
  }
}
