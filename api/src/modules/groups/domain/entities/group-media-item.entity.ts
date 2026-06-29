import { MediaType } from '@/generated/prisma/client.js';
import { GroupUser } from '@/modules/groups/domain/entities/group-user.entity.js';

export class GroupMediaItem {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly url: string,
    public readonly thumbnailUrl: string | null,
    public readonly type: MediaType,
    public readonly alt: string | null,
    public readonly createdAt: Date,
    public readonly author: GroupUser,
  ) {}
}
