import { Injectable } from '@nestjs/common';
import { type Prisma } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';
import {
  ListFriendsInput,
  RemoveFriendInput,
} from '@/modules/friends/domain/types/friend.type.js';
import { FriendshipPair } from '@/modules/friends/domain/value-objects/friendship-pair.value-object.js';
import { FriendMapper } from '@/modules/friends/infrastructure/persistence/mappers/friend.mapper.js';
import { FriendshipRepository } from '../../domain/repositories/friend-ship.repository.interface.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaFriendShipRepository implements FriendshipRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async removeFriend(input: RemoveFriendInput): Promise<void> {
    const client = this.getClient();

    try {
      const pair = FriendshipPair.create(input.userId, input.friendId);
      const friendship = await client.friendship.findUnique({
        where: {
          user1Id_user2Id: {
            user1Id: pair.user1Id,
            user2Id: pair.user2Id,
          },
        },
        select: { user1Id: true, user2Id: true },
      });

      if (!friendship) {
        throw new DomainError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Friendship not found',
          404,
        );
      }

      await client.friendship.delete({
        where: {
          user1Id_user2Id: {
            user1Id: pair.user1Id,
            user2Id: pair.user2Id,
          },
        },
      });
      await client.userProfile.updateMany({
        where: {
          userId: { in: [pair.user1Id, pair.user2Id] },
          deletedAt: null,
        },
        data: {
          friendCount: {
            decrement: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async listFriends(input: ListFriendsInput): Promise<Friendship[]> {
    const client = this.getClient();

    try {
      const friendships = await client.friendship.findMany({
        where: {
          OR: [{ user1Id: input.userId }, { user2Id: input.userId }],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user1: { select: FriendMapper.friendUserSelect },
          user2: { select: FriendMapper.friendUserSelect },
        },
      });

      return friendships.map((friendship) => {
        const friend =
          friendship.user1Id === input.userId
            ? friendship.user2
            : friendship.user1;

        return FriendMapper.toFriendshipDomain(friend, friendship.createdAt);
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
