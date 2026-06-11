import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { CreatePostInput } from '@/modules/posts/domain/types/create-post-input.type.js';
import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';
import { SharePostInput } from '@/modules/posts/domain/types/share-post-input.type.js';
import { PostMapper } from '@/modules/posts/infrastructure/persistence/mappers/post.mapper.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(input: CreatePostInput): Promise<Post> {
    const client = this.getClient();

    try {
      const post = await client.post.create({
        data: PostMapper.toPersistence(input),
        include: PostMapper.includeForViewer(input.authorId),
      });

      return PostMapper.toDomain(post);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async share(input: SharePostInput): Promise<Post> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(
        client,
        input.originalPostId,
        input.authorId,
      );

      const post = await client.post.create({
        data: PostMapper.toSharePersistence({
          authorId: input.authorId,
          originalPostId: input.originalPostId,
          content: input.content ?? '',
          visibility: input.visibility,
        }),
        include: PostMapper.includeForViewer(input.authorId),
      });

      await client.postStats.update({
        where: { postId: input.originalPostId },
        data: {
          shareCount: {
            increment: 1,
          },
        },
      });

      return PostMapper.toDomain(post);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async findPage(query: ListPostsQuery): Promise<ListPostsPage> {
    const client = this.getClient();

    try {
      const posts = await client.post.findMany({
        where: {
          deletedAt: null,
          isHidden: false,
          ...(query.authorId ? { authorId: query.authorId } : {}),
          AND: [
            this.getVisibilityWhere(query.viewerId),
            ...(query.cursor
              ? [
                  {
                    OR: [
                      { createdAt: { lt: query.cursor.createdAt } },
                      {
                        createdAt: query.cursor.createdAt,
                        id: { lt: query.cursor.id },
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: query.limit + 1,
        include: PostMapper.includeForViewer(query.viewerId),
      });
      const hasNextPage = posts.length > query.limit;
      const pageItems = hasNextPage ? posts.slice(0, query.limit) : posts;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((post) => PostMapper.toDomain(post)),
        nextCursor:
          hasNextPage && lastItem
            ? { createdAt: lastItem.createdAt, id: lastItem.id }
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAuthorId(postId: string): Promise<string | null> {
    const client = this.getClient();
    const post = await client.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
        isHidden: false,
      },
      select: {
        authorId: true,
      },
    });

    return post?.authorId ?? null;
  }

  private getVisibilityWhere(viewerId?: string): Prisma.PostWhereInput {
    if (!viewerId) {
      return { visibility: 'PUBLIC' };
    }

    return { OR: [{ visibility: 'PUBLIC' }, { authorId: viewerId }] };
  }

  private async assertVisiblePost(
    client: PrismaClientLike,
    postId: string,
    viewerId: string,
  ): Promise<void> {
    const post = await client.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
        isHidden: false,
        ...this.getVisibilityWhere(viewerId),
      },
      select: { id: true },
    });

    if (!post) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }
  }
}
