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
import { PostMapper } from '@/modules/posts/infrastructure/persistence/mappers/post.mapper.js';

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

  async findPage(query: ListPostsQuery): Promise<ListPostsPage> {
    const client = this.getClient();

    try {
      const posts = await client.post.findMany({
        where: {
          deletedAt: null,
          isHidden: false,
          AND: [
            { OR: [{ visibility: 'PUBLIC' }, { authorId: query.viewerId }] },
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
}
