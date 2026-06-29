import { GroupPrivacy } from '@/generated/prisma/client.js';

export class PostGroup {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly avatarUrl: string | null,
    public readonly privacy: GroupPrivacy,
  ) {}
}
