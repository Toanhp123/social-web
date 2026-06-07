import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { CommentDraft } from '@/modules/comments/domain/entities/comment-draft.entity.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CommentRepository } from '@/modules/comments/domain/repositories/comment.repository.interface.js';
import { CreateCommentInput } from '@/modules/comments/domain/types/create-comment-input.type.js';
import {
  ListCommentsPage,
  ListCommentsQuery,
} from '@/modules/comments/domain/types/list-comments-query.type.js';
import { CommentMapper } from '@/modules/comments/infrastructure/persistence/mappers/comment.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

type ParentComment = {
  id: string;
  rootId: string;
  path: string;
  depth: number;
};

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(client, input.postId, input.userId);

      const parent = input.parentId
        ? await this.findParentComment(client, input.postId, input.parentId)
        : null;
      const id = randomUUID();
      const depth = parent ? parent.depth + 1 : 0;

      CommentDraft.assertReplyDepth(depth);

      const comment = await client.comment.create({
        data: CommentMapper.toPersistence({
          ...input,
          id,
          parentId: parent?.id,
          rootId: parent?.rootId ?? id,
          path: parent ? `${parent.path}/${id}` : id,
          depth,
        }),
        include: CommentMapper.include,
      });

      await client.postStats.update({
        where: { postId: input.postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      if (parent) {
        await client.commentStats.upsert({
          where: { commentId: parent.id },
          create: {
            commentId: parent.id,
            replyCount: 1,
          },
          update: {
            replyCount: {
              increment: 1,
            },
          },
        });
      }

      return CommentMapper.toDomain(comment);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async findPage(query: ListCommentsQuery): Promise<ListCommentsPage> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(client, query.postId, query.viewerId);

      if (query.parentId) {
        await this.assertExistingComment(client, query.postId, query.parentId);
      }

      const isReplyPage = Boolean(query.parentId);

      const cursorFilter = query.cursor
        ? isReplyPage
          ? {
              OR: [
                { createdAt: { gt: query.cursor.createdAt } },
                {
                  createdAt: query.cursor.createdAt,
                  id: { gt: query.cursor.id },
                },
              ],
            }
          : {
              OR: [
                { createdAt: { lt: query.cursor.createdAt } },
                {
                  createdAt: query.cursor.createdAt,
                  id: { lt: query.cursor.id },
                },
              ],
            }
        : {};

      const comments = await client.comment.findMany({
        where: {
          postId: query.postId,
          parentId: query.parentId ?? null,
          deletedAt: null,
          isHidden: false,
          ...cursorFilter,
        },
        orderBy: isReplyPage
          ? [{ createdAt: 'asc' }, { id: 'asc' }]
          : [{ createdAt: 'desc' }, { id: 'desc' }],
        take: query.limit + 1,
        include: CommentMapper.include,
      });

      const hasNextPage = comments.length > query.limit;
      const pageItems = hasNextPage ? comments.slice(0, query.limit) : comments;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((comment) => CommentMapper.toDomain(comment)),
        nextCursor:
          hasNextPage && lastItem
            ? { createdAt: lastItem.createdAt, id: lastItem.id }
            : null,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  private async assertVisiblePost(
    client: PrismaClientLike,
    postId: string,
    viewerId?: string,
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

  private async findParentComment(
    client: PrismaClientLike,
    postId: string,
    parentId: string,
  ): Promise<ParentComment> {
    const parent = await client.comment.findFirst({
      where: {
        id: parentId,
        postId,
        deletedAt: null,
        isHidden: false,
      },
      select: {
        id: true,
        rootId: true,
        path: true,
        depth: true,
      },
    });

    if (!parent) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Parent comment not found',
        404,
      );
    }

    return parent;
  }

  private async assertExistingComment(
    client: PrismaClientLike,
    postId: string,
    commentId: string,
  ): Promise<void> {
    await this.findParentComment(client, postId, commentId);
  }

  private getVisibilityWhere(viewerId?: string): Prisma.PostWhereInput {
    if (!viewerId) {
      return { visibility: 'PUBLIC' };
    }

    return { OR: [{ visibility: 'PUBLIC' }, { authorId: viewerId }] };
  }
}
