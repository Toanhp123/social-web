import { Injectable } from '@nestjs/common';
import { User } from '@/modules/users/domain/entities/user.entity.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { UserRepository } from '@/modules/users/domain/repositories/user.repository.interface.js';
import { CreateUserInput } from '@/modules/users/domain/types/create-user-input.type.js';
import { UserMapper } from '@/modules/users/infrastructure/persistence/mappers/user.mapper.js';
import { UserProfileMapper } from '@/modules/users/infrastructure/persistence/mappers/user-profile.mapper.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import type { Prisma } from '@/generated/prisma/client.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { UserProfile } from '@/modules/users/domain/entities/user-profile.entity.js';
import { UserSummary } from '@/modules/users/domain/entities/user-summary.entity.js';
import { ListUserDiscoveryQuery } from '@/modules/users/domain/types/list-user-discovery-query.type.js';
import { UserProfileInput } from '@/modules/users/domain/types/user-profile-input.type.js';
import { DatabaseError } from '@/core/exceptions/database.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async create(input: CreateUserInput): Promise<void> {
    const client = this.getClient();

    try {
      await client.user.create({
        data: UserMapper.toPersistence(input),
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    const client = this.getClient();

    try {
      const user = await client.user.findUnique({
        where: { id },
        select: UserMapper.select,
      });

      return user ? UserMapper.toDomain(user) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findDiscoveryCandidates(
    query: ListUserDiscoveryQuery,
  ): Promise<UserSummary[]> {
    const client = this.getClient();
    const limit = query.limit ?? 12;
    const searchQuery = query.query?.trim();

    try {
      const friendships = await client.friendship.findMany({
        where: {
          OR: [{ user1Id: query.viewerId }, { user2Id: query.viewerId }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      });
      const pendingRequests = await client.friendRequest.findMany({
        where: {
          status: 'PENDING',
          OR: [{ requesterId: query.viewerId }, { receiverId: query.viewerId }],
        },
        select: {
          requesterId: true,
          receiverId: true,
        },
      });
      const excludedUserIds = new Set<string>([query.viewerId]);

      friendships.forEach((friendship) => {
        excludedUserIds.add(
          friendship.user1Id === query.viewerId
            ? friendship.user2Id
            : friendship.user1Id,
        );
      });
      pendingRequests.forEach((request) => {
        excludedUserIds.add(
          request.requesterId === query.viewerId
            ? request.receiverId
            : request.requesterId,
        );
      });

      const users = await client.user.findMany({
        where: {
          id: {
            notIn: [...excludedUserIds],
          },
          ...(searchQuery
            ? {
                OR: [
                  {
                    fullName: {
                      contains: searchQuery,
                      mode: 'insensitive',
                    },
                  },
                  {
                    username: {
                      contains: searchQuery,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        select: UserMapper.summarySelect,
      });

      return users.map((user) => UserMapper.toSummaryDomain(user));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findProfileByUserId(userId: string): Promise<UserProfile | null> {
    const client = this.getClient();

    try {
      const user = await client.user.findUnique({
        where: { id: userId },
        select: UserProfileMapper.select,
      });

      return user ? UserProfileMapper.toDomain(user) : null;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async createProfile(
    userId: string,
    input: UserProfileInput,
  ): Promise<UserProfile> {
    const client = this.getClient();

    try {
      const existingProfile = await client.userProfile.findUnique({
        where: { userId },
        select: { deletedAt: true },
      });

      if (existingProfile && !existingProfile.deletedAt) {
        throw new DatabaseError(
          'Record already exists',
          { userId },
          ErrorCode.DUPLICATE_FIELD,
          409,
        );
      }

      if (existingProfile) {
        await client.userProfile.update({
          where: { userId },
          data: {
            ...UserProfileMapper.toPersistence(input),
            deletedAt: null,
          },
        });
      } else {
        await client.userProfile.create({
          data: {
            userId,
            ...UserProfileMapper.toPersistence(input),
          },
        });
      }

      return await this.getRequiredProfile(client, userId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async updateProfile(
    userId: string,
    input: UserProfileInput,
  ): Promise<UserProfile> {
    const client = this.getClient();

    try {
      const result = await client.userProfile.updateMany({
        where: { userId, deletedAt: null },
        data: UserProfileMapper.toPersistence(input),
      });

      if (result.count === 0) {
        throw new DatabaseError(
          'Record not found',
          { userId },
          ErrorCode.RECORD_NOT_FOUND,
          404,
        );
      }

      return await this.getRequiredProfile(client, userId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    const client = this.getClient();

    try {
      const result = await client.userProfile.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (result.count === 0) {
        throw new DatabaseError(
          'Record not found',
          { userId },
          ErrorCode.RECORD_NOT_FOUND,
          404,
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async updateAvatarUrl(
    userId: string,
    avatarUrl: string | null,
  ): Promise<UserProfile> {
    const client = this.getClient();

    try {
      await client.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });

      return await this.getRequiredProfile(client, userId);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updateCoverUrl(
    userId: string,
    coverUrl: string | null,
  ): Promise<UserProfile> {
    const client = this.getClient();

    try {
      await client.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          coverUrl,
        },
        update: { coverUrl, deletedAt: null },
      });

      return await this.getRequiredProfile(client, userId);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private async getRequiredProfile(
    client: PrismaClientLike,
    userId: string,
  ): Promise<UserProfile> {
    const user = await client.user.findUniqueOrThrow({
      where: { id: userId },
      select: UserProfileMapper.select,
    });

    return UserProfileMapper.toDomain(user);
  }
}
