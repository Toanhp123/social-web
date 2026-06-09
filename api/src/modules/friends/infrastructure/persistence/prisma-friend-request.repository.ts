import { Injectable } from '@nestjs/common';
import { FriendRequestRepository } from '../../domain/repositories/friend-request.repository.interface.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { FriendRequestStatus, type Prisma } from '@/generated/prisma/client.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { FriendMapper } from './mappers/friend.mapper.js';
import {
  AcceptFriendRequestResult,
  FriendRequestActionInput,
  ListFriendRequestsInput,
  SendFriendRequestInput,
} from '../../domain/types/friend.type.js';
import { FriendRequest } from '../../domain/entities/friend-request.entity.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { FriendshipPair } from '../../domain/value-objects/friendship-pair.value-object.js';
import { Friendship } from '../../domain/entities/friendship.entity.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaFriendRequestRepository implements FriendRequestRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async sendRequest(input: SendFriendRequestInput): Promise<FriendRequest> {
    const client = this.getClient();

    try {
      await this.assertUserExists(client, input.receiverId);
      await this.assertNotFriends(client, input.requesterId, input.receiverId);
      await this.assertNoPendingRequest(
        client,
        input.requesterId,
        input.receiverId,
      );

      const request = await client.friendRequest.upsert({
        where: {
          requesterId_receiverId: {
            requesterId: input.requesterId,
            receiverId: input.receiverId,
          },
        },
        create: {
          requesterId: input.requesterId,
          receiverId: input.receiverId,
        },
        update: {
          status: FriendRequestStatus.PENDING,
        },
        include: FriendMapper.requestInclude,
      });

      return FriendMapper.toRequestDomain(request);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async acceptRequest(
    input: FriendRequestActionInput,
  ): Promise<AcceptFriendRequestResult> {
    const client = this.getClient();

    try {
      const existingRequest = await this.getActionableReceivedRequest(
        client,
        input,
      );
      const pair = FriendshipPair.create(
        existingRequest.requesterId,
        existingRequest.receiverId,
      );

      await client.friendship.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: pair.user1Id,
            user2Id: pair.user2Id,
          },
        },
        create: {
          user1Id: pair.user1Id,
          user2Id: pair.user2Id,
        },
        update: {},
      });

      await client.userProfile.updateMany({
        where: {
          userId: {
            in: [existingRequest.requesterId, existingRequest.receiverId],
          },
          deletedAt: null,
        },
        data: {
          friendCount: {
            increment: 1,
          },
        },
      });

      const request = await client.friendRequest.update({
        where: { id: input.requestId },
        data: { status: FriendRequestStatus.ACCEPTED },
        include: FriendMapper.requestInclude,
      });

      return {
        request: FriendMapper.toRequestDomain(request),
        friendship: await this.getFriendship(
          client,
          existingRequest.receiverId,
          existingRequest.requesterId,
        ),
      };
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async rejectRequest(input: FriendRequestActionInput): Promise<FriendRequest> {
    const client = this.getClient();

    try {
      await this.getActionableReceivedRequest(client, input);

      const request = await client.friendRequest.update({
        where: { id: input.requestId },
        data: { status: FriendRequestStatus.REJECTED },
        include: FriendMapper.requestInclude,
      });

      return FriendMapper.toRequestDomain(request);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async cancelRequest(input: FriendRequestActionInput): Promise<void> {
    const client = this.getClient();

    try {
      const request = await client.friendRequest.findFirst({
        where: {
          id: input.requestId,
          requesterId: input.userId,
          status: FriendRequestStatus.PENDING,
        },
        select: { id: true },
      });

      if (!request) {
        throw new DomainError(
          ErrorCode.RESOURCE_NOT_FOUND,
          'Friend request not found',
          404,
        );
      }

      await client.friendRequest.delete({ where: { id: input.requestId } });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async listRequests(input: ListFriendRequestsInput): Promise<FriendRequest[]> {
    const client = this.getClient();
    const where =
      input.direction === 'incoming'
        ? { receiverId: input.userId }
        : { requesterId: input.userId };

    try {
      const requests = await client.friendRequest.findMany({
        where: {
          ...where,
          status: FriendRequestStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
        include: FriendMapper.requestInclude,
      });

      return requests.map((request) => FriendMapper.toRequestDomain(request));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private async getFriendship(
    client: PrismaClientLike,
    userId: string,
    friendId: string,
  ): Promise<Friendship> {
    const pair = FriendshipPair.create(userId, friendId);
    const friendship = await client.friendship.findUniqueOrThrow({
      where: {
        user1Id_user2Id: {
          user1Id: pair.user1Id,
          user2Id: pair.user2Id,
        },
      },
      include: {
        user1: { select: FriendMapper.friendUserSelect },
        user2: { select: FriendMapper.friendUserSelect },
      },
    });
    const friend =
      friendship.user1Id === userId ? friendship.user2 : friendship.user1;

    return FriendMapper.toFriendshipDomain(friend, friendship.createdAt);
  }

  private async getActionableReceivedRequest(
    client: PrismaClientLike,
    input: FriendRequestActionInput,
  ): Promise<{ requesterId: string; receiverId: string }> {
    const request = await client.friendRequest.findFirst({
      where: {
        id: input.requestId,
        receiverId: input.userId,
        status: FriendRequestStatus.PENDING,
      },
      select: {
        requesterId: true,
        receiverId: true,
      },
    });

    if (!request) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Friend request not found',
        404,
      );
    }

    return request;
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

  private async assertNotFriends(
    client: PrismaClientLike,
    firstUserId: string,
    secondUserId: string,
  ): Promise<void> {
    const pair = FriendshipPair.create(firstUserId, secondUserId);
    const friendship = await client.friendship.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: pair.user1Id,
          user2Id: pair.user2Id,
        },
      },
      select: { user1Id: true },
    });

    if (friendship) {
      throw new DomainError(
        ErrorCode.RESOURCE_CONFLICT,
        'Users are already friends',
        409,
      );
    }
  }

  private async assertNoPendingRequest(
    client: PrismaClientLike,
    requesterId: string,
    receiverId: string,
  ): Promise<void> {
    const pendingRequest = await client.friendRequest.findFirst({
      where: {
        status: FriendRequestStatus.PENDING,
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
      select: { id: true },
    });

    if (pendingRequest) {
      throw new DomainError(
        ErrorCode.RESOURCE_CONFLICT,
        'Friend request already exists',
        409,
      );
    }
  }
}
