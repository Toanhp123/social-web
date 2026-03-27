export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string, // phải là hashed password
    public readonly name?: string,
  ) {}

  static create(
    email: string,
    hashedPassword: string,
    name?: string,
  ): AuthUser {
    // Domain validation
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!hashedPassword || hashedPassword.length < 8) {
      throw new Error('Password hash is invalid');
    }

    if (name && name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    // Tạo entity với id rỗng (sẽ được gán sau khi lưu vào database)
    return new AuthUser(
      '', // id sẽ được Prisma gán sau
      email.toLowerCase().trim(),
      hashedPassword,
      name?.trim(),
    );
  }

  isValidEmail(): boolean {
    return this.email.includes('@');
  }
}
