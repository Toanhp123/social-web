import { Injectable } from '@nestjs/common';
import { type Prisma } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { Follow } from '@/modules/follows/domain/entities/follow.entity.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import { FollowRepository } from '@/modules/follows/domain/repositories/follow.repository.interface.js';
import {
  FollowUserInput,
  ListFollowsInput,
} from '@/modules/follows/domain/types/follow.type.js';
import { FollowPair } from '@/modules/follows/domain/value-objects/follow-pair.value-object.js';
import { FollowMapper } from './mappers/follow.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaFollowRepository implements FollowRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async follow(input: FollowUserInput): Promise<FollowStatus> {
    const client = this.getClient();

    try {
      const pair = FollowPair.create(input.followerId, input.followingId);
      await this.assertUserExists(client, pair.followingId);

      const existingFollow = await client.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: pair.followerId,
            followingId: pair.followingId,
          },
        },
        select: { followerId: true },
      });

      if (!existingFollow) {
        await client.follow.create({
          data: {
            followerId: pair.followerId,
            followingId: pair.followingId,
          },
        });
        await this.updateFollowCounts(client, pair, 1);
      }

      return await this.getStatusByPair(client, pair);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async unfollow(input: FollowUserInput): Promise<FollowStatus> {
    const client = this.getClient();

    try {
      const pair = FollowPair.create(input.followerId, input.followingId);
      await this.assertUserExists(client, pair.followingId);

      const existingFollow = await client.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: pair.followerId,
            followingId: pair.followingId,
          },
        },
        select: { followerId: true },
      });

      if (existingFollow) {
        await client.follow.delete({
          where: {
            followerId_followingId: {
              followerId: pair.followerId,
              followingId: pair.followingId,
            },
          },
        });
        await this.updateFollowCounts(client, pair, -1);
      }

      return await this.getStatusByPair(client, pair);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async getStatus(input: FollowUserInput): Promise<FollowStatus> {
    const client = this.getClient();

    try {
      const pair = FollowPair.create(input.followerId, input.followingId);
      await this.assertUserExists(client, pair.followingId);

      return await this.getStatusByPair(client, pair);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async listFollowers(input: ListFollowsInput): Promise<Follow[]> {
    const client = this.getClient();

    try {
      const follows = await client.follow.findMany({
        where: { followingId: input.userId },
        orderBy: { createdAt: 'desc' },
        include: FollowMapper.include,
      });

      return follows.map((follow) => FollowMapper.toFollowerDomain(follow));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async listFollowing(input: ListFollowsInput): Promise<Follow[]> {
    const client = this.getClient();

    try {
      const follows = await client.follow.findMany({
        where: { followerId: input.userId },
        orderBy: { createdAt: 'desc' },
        include: FollowMapper.include,
      });

      return follows.map((follow) => FollowMapper.toFollowingDomain(follow));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private async getStatusByPair(
    client: PrismaClientLike,
    pair: FollowPair,
  ): Promise<FollowStatus> {
    const [follow, targetUser] = await Promise.all([
      client.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: pair.followerId,
            followingId: pair.followingId,
          },
        },
        select: { followerId: true },
      }),
      client.user.findUniqueOrThrow({
        where: { id: pair.followingId },
        select: {
          followerCount: true,
          followingCount: true,
        },
      }),
    ]);

    return new FollowStatus(
      Boolean(follow),
      targetUser.followerCount,
      targetUser.followingCount,
    );
  }

  private async updateFollowCounts(
    client: PrismaClientLike,
    pair: FollowPair,
    delta: 1 | -1,
  ): Promise<void> {
    await client.user.update({
      where: { id: pair.followerId },
      data: {
        followingCount:
          delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) },
      },
    });
    await client.user.update({
      where: { id: pair.followingId },
      data: {
        followerCount:
          delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) },
      },
    });
  }

  private async assertUserExists(
    client: PrismaClientLike,
    userId: string,
  ): Promise<void> {
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new DomainError(ErrorCode.USER_NOT_FOUND, 'User not found', 404);
    }
  }
}
