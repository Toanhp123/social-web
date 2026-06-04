import { PostType, PostVisibility } from '@/generated/prisma/client.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';

export class Post {
  constructor(
    public readonly id: string,
    public readonly author: PostAuthor,
    public readonly content: string,
    public readonly type: PostType,
    public readonly visibility: PostVisibility,
    public readonly media: PostMedia[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
