import { MediaType, PostType, Prisma } from '@/generated/prisma/client.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { PostGroup } from '@/modules/posts/domain/entities/post-group.entity.js';
import { PostMedia } from '@/modules/posts/domain/entities/post-media.entity.js';
import { PostReactionStats } from '@/modules/posts/domain/entities/post-reaction-stats.entity.js';
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
  group: {
    select: {
      id: true,
      name: true,
      slug: true,
      avatarUrl: true,
      privacy: true,
    },
  },
  stats: true,
} as const;

const ANONYMOUS_VIEWER_ID = '__anonymous_viewer__';

export function getPostInclude(viewerId?: string) {
  return {
    ...POST_INCLUDE,
    reactions: {
      where: {
        userId: viewerId ?? ANONYMOUS_VIEWER_ID,
        deletedAt: null,
      },
      select: {
        type: true,
      },
      take: 1,
    },
  } as const;
}

type PostPayload = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostInclude>;
}>;

type CreatePostData = Prisma.PostUncheckedCreateInput;

export class PostMapper {
  static includeForViewer = getPostInclude;

  static toDomain(prismaPost: PostPayload): Post {
    const stats = prismaPost.stats;

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
      prismaPost.originalPostId,
      prismaPost.groupId,
      prismaPost.group
        ? new PostGroup(
            prismaPost.group.id,
            prismaPost.group.name,
            prismaPost.group.slug,
            prismaPost.group.avatarUrl,
            prismaPost.group.privacy,
          )
        : null,
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
      stats
        ? new PostReactionStats(
            stats.likeCount,
            stats.loveCount,
            stats.hahaCount,
            stats.wowCount,
            stats.sadCount,
            stats.angryCount,
            stats.totalReactionCount,
            stats.commentCount,
            stats.shareCount,
          )
        : PostReactionStats.empty(),
      prismaPost.reactions.at(0)?.type ?? null,
    );
  }

  static toPersistence(input: CreatePostInput): CreatePostData {
    return {
      authorId: input.authorId,
      content: input.content,
      visibility: input.visibility,
      groupId: input.groupId ?? null,
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

  static toSharePersistence(input: {
    authorId: string;
    originalPostId: string;
    content: string;
    visibility?: Prisma.PostUncheckedCreateInput['visibility'];
  }): CreatePostData {
    return {
      authorId: input.authorId,
      originalPostId: input.originalPostId,
      content: input.content,
      visibility: input.visibility,
      type: PostType.SHARE,
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
