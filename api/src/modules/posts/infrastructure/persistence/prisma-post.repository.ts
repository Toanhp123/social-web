import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import {
  ReportStatus,
  ReportType,
  type Prisma,
} from '@/generated/prisma/client.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostReactionStats } from '@/modules/posts/domain/entities/post-reaction-stats.entity.js';
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

  async softDelete(input: {
    postId: string;
    deletedById: string;
  }): Promise<void> {
    const client = this.getClient();

    try {
      const result = await client.post.updateMany({
        where: {
          id: input.postId,
          authorId: input.deletedById,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new DomainError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Post not found',
          404,
        );
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async report(input: {
    postId: string;
    reporterId: string;
    reason?: string | null;
  }): Promise<void> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(client, input.postId, input.reporterId);

      const existingReport = await client.report.findFirst({
        where: {
          reporterId: input.reporterId,
          targetPostId: input.postId,
          type: ReportType.POST,
          status: ReportStatus.CANCELED,
        },
        select: {
          id: true,
        },
      });

      if (existingReport) {
        await client.report.update({
          where: { id: existingReport.id },
          data: {
            reason: input.reason ?? null,
            status: ReportStatus.PENDING,
            reviewedAt: null,
          },
        });
        return;
      }

      await client.report.create({
        data: {
          reporterId: input.reporterId,
          targetPostId: input.postId,
          type: ReportType.POST,
          reason: input.reason ?? null,
          status: ReportStatus.PENDING,
        },
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async cancelReport(input: {
    postId: string;
    reporterId: string;
  }): Promise<boolean> {
    const client = this.getClient();

    try {
      const result = await client.report.updateMany({
        where: {
          reporterId: input.reporterId,
          targetPostId: input.postId,
          type: ReportType.POST,
          status: ReportStatus.PENDING,
        },
        data: {
          status: ReportStatus.CANCELED,
          reviewedAt: new Date(),
        },
      });

      return result.count > 0;
    } catch (error) {
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
            ...this.getSearchWhere(query.search),
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

  async findDiscoveryPage(
    query: ListPostsQuery & { viewerId: string },
  ): Promise<ListPostsPage> {
    const client = this.getClient();

    try {
      const posts = await client.post.findMany({
        where: {
          deletedAt: null,
          isHidden: false,
          feedItems: {
            none: {
              userId: query.viewerId,
            },
          },
          AND: [
            this.getVisibilityWhere(query.viewerId),
            ...this.getSearchWhere(query.search),
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
            ? {
                createdAt: lastItem.createdAt,
                id: lastItem.id,
                phase: 'discover',
              }
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async hasReportedPost(input: {
    postId: string;
    reporterId: string;
  }): Promise<boolean> {
    const client = this.getClient();
    const report = await client.report.findFirst({
      where: {
        reporterId: input.reporterId,
        targetPostId: input.postId,
        type: ReportType.POST,
        status: ReportStatus.PENDING,
      },
      select: {
        id: true,
      },
    });

    return Boolean(report);
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

  async findReactionStats(input: {
    postId: string;
    viewerId?: string;
  }): Promise<PostReactionStats | null> {
    const client = this.getClient();
    const post = await client.post.findFirst({
      where: {
        id: input.postId,
        deletedAt: null,
        isHidden: false,
        ...this.getVisibilityWhere(input.viewerId),
      },
      select: {
        stats: true,
      },
    });

    if (!post?.stats) {
      return null;
    }

    const stats = post.stats;

    return new PostReactionStats(
      stats.likeCount,
      stats.loveCount,
      stats.hahaCount,
      stats.wowCount,
      stats.sadCount,
      stats.angryCount,
      stats.totalReactionCount,
      stats.commentCount,
      stats.shareCount,
    );
  }

  private getVisibilityWhere(viewerId?: string): Prisma.PostWhereInput {
    if (!viewerId) {
      return { visibility: 'PUBLIC' };
    }

    return { OR: [{ visibility: 'PUBLIC' }, { authorId: viewerId }] };
  }

  private getSearchWhere(search?: string): Prisma.PostWhereInput[] {
    if (!search) {
      return [];
    }

    return [
      {
        OR: [
          {
            content: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            author: {
              OR: [
                {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  username: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      },
    ];
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
