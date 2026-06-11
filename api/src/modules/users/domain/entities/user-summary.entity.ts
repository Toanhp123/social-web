export class UserSummary {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly username: string | null,
    public readonly avatarUrl: string | null,
  ) {}
}
