import { MediaType, PostType, Prisma } from '@/generated/prisma/client.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { CreatePostInput } from '@/modules/posts/domain/types/create-post-input.type.js';

export const POST_INCLUDE = {
  author: {
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
    },
  },
  media: {
    orderBy: {
      order: 'asc',
    },
  },
} as const;

type PostPayload = Prisma.PostGetPayload<{
  include: typeof POST_INCLUDE;
}>;

type CreatePostData = Prisma.PostUncheckedCreateInput;

export class PostMapper {
  static include = POST_INCLUDE;

  static toDomain(prismaPost: PostPayload): Post {
    return new Post(
      prismaPost.id,
      new PostAuthor(
        prismaPost.author.id,
        prismaPost.author.fullName,
        prismaPost.author.username,
        prismaPost.author.avatarUrl,
      ),
      prismaPost.content,
      prismaPost.type,
      prismaPost.visibility,
      prismaPost.media.map(
        (media) =>
          new PostMedia(
            media.id,
            media.url,
            media.thumbnailUrl,
            media.mimeType,
            media.size,
            media.type,
            media.width,
            media.height,
            media.duration,
            media.order,
            media.alt,
          ),
      ),
      prismaPost.createdAt,
      prismaPost.updatedAt,
    );
  }

  static toPersistence(input: CreatePostInput): CreatePostData {
    return {
      authorId: input.authorId,
      content: input.content,
      visibility: input.visibility,
      type: this.getTypeFromMedia(input.media.length),
      media:
        input.media.length > 0
          ? {
              create: input.media.map((media) => ({
                url: media.url,
                thumbnailUrl: media.thumbnailUrl,
                mimeType: media.mimeType,
                size: media.size,
                type: media.type,
                width: media.width,
                height: media.height,
                duration: media.duration,
                order: media.order,
                alt: media.alt,
              })),
            }
          : undefined,
      stats: {
        create: {},
      },
    };
  }

  private static getTypeFromMedia(mediaCount: number): PostType {
    return mediaCount > 0 ? PostType.MEDIA : PostType.TEXT;
  }

  static getMediaTypeFromResource(resourceType: 'image' | 'video'): MediaType {
    return resourceType === 'video' ? MediaType.VIDEO : MediaType.IMAGE;
  }
}
