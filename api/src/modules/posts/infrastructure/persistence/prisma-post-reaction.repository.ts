import { Injectable } from '@nestjs/common';
import { ReactionType, type Prisma } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostReactionRepository } from '@/modules/posts/domain/repositories/post-reaction.repository.interface.js';
import {
  RemovePostReactionInput,
  SetPostReactionInput,
} from '@/modules/posts/domain/types/post-reaction.type.js';
import { PostReactionMapper } from '@/modules/posts/infrastructure/persistence/mappers/post-reaction.mapper.js';
import { PostMapper } from '@/modules/posts/infrastructure/persistence/mappers/post.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaPostReactionRepository implements PostReactionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async set(input: SetPostReactionInput): Promise<Post> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(client, input.postId, input.userId);

      const currentReaction = await client.reaction.findUnique({
        where: PostReactionMapper.toUniqueWhere(input),
      });

      if (!currentReaction || currentReaction.deletedAt) {
        await this.createOrRestoreReaction(
          client,
          input,
          Boolean(currentReaction),
        );
        await this.updateReactionStats(client, input.postId, input.type, 1);

        return this.findVisiblePost(client, input.postId, input.userId);
      }

      if (currentReaction.type === input.type) {
        return this.findVisiblePost(client, input.postId, input.userId);
      }

      await client.reaction.update({
        where: PostReactionMapper.toUniqueWhere(input),
        data: PostReactionMapper.toChangeTypeData(input.type),
      });
      await this.updateReactionStats(
        client,
        input.postId,
        currentReaction.type,
        -1,
        false,
      );
      await this.updateReactionStats(
        client,
        input.postId,
        input.type,
        1,
        false,
      );

      return this.findVisiblePost(client, input.postId, input.userId);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async remove(input: RemovePostReactionInput): Promise<Post> {
    const client = this.getClient();

    try {
      await this.assertVisiblePost(client, input.postId, input.userId);

      const currentReaction = await client.reaction.findUnique({
        where: PostReactionMapper.toUniqueWhere(input),
      });

      if (!currentReaction || currentReaction.deletedAt) {
        return this.findVisiblePost(client, input.postId, input.userId);
      }

      await client.reaction.update({
        where: PostReactionMapper.toUniqueWhere(input),
        data: PostReactionMapper.toSoftDeleteData(),
      });
      await this.updateReactionStats(
        client,
        input.postId,
        currentReaction.type,
        -1,
      );

      return this.findVisiblePost(client, input.postId, input.userId);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  private async createOrRestoreReaction(
    client: PrismaClientLike,
    input: SetPostReactionInput,
    shouldRestore: boolean,
  ): Promise<void> {
    if (shouldRestore) {
      await client.reaction.update({
        where: PostReactionMapper.toUniqueWhere(input),
        data: PostReactionMapper.toRestoreData(input.type),
      });

      return;
    }

    await client.reaction.create({
      data: PostReactionMapper.toPersistence(input),
    });
  }

  private async assertVisiblePost(
    client: PrismaClientLike,
    postId: string,
    viewerId: string,
  ): Promise<void> {
    const post = await client.post.findFirst({
      where: PostReactionMapper.toVisiblePostWhere(postId, viewerId),
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

  private async findVisiblePost(
    client: PrismaClientLike,
    postId: string,
    viewerId: string,
  ): Promise<Post> {
    const post = await client.post.findFirst({
      where: PostReactionMapper.toVisiblePostWhere(postId, viewerId),
      include: PostMapper.includeForViewer(viewerId),
    });

    if (!post) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }

    return PostMapper.toDomain(post);
  }

  private async updateReactionStats(
    client: PrismaClientLike,
    postId: string,
    type: ReactionType,
    delta: 1 | -1,
    includeTotal = true,
  ): Promise<void> {
    await client.postStats.update({
      where: { postId },
      data: PostReactionMapper.toStatsDeltaData(type, delta, includeTotal),
    });
  }
}
