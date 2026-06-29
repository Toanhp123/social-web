import { Injectable } from '@nestjs/common';
import {
  GroupJoinRequestStatus,
  GroupMemberRole,
  type Prisma,
} from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { GroupMember } from '@/modules/groups/domain/entities/group-member.entity.js';
import { GroupRepository } from '@/modules/groups/domain/repositories/group.repository.interface.js';
import {
  CreateGroupInput,
  GroupMembership,
  ListGroupsInput,
  ListGroupsPage,
} from '@/modules/groups/domain/types/group.type.js';
import { GROUP_USER_SELECT, GroupMapper } from './mappers/group.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class PrismaGroupRepository implements GroupRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  private runTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const existingClient = this.txContext.getClient();

    if (existingClient) {
      return callback(existingClient);
    }

    return this.prisma.$transaction(callback);
  }

  async create(input: CreateGroupInput): Promise<Group> {
    const client = this.getClient();

    try {
      const group = await client.group.create({
        data: GroupMapper.toPersistence({
          ...input,
          slug: await this.createUniqueSlug(client, input.name),
        }),
        include: GroupMapper.includeForViewer(input.ownerId),
      });

      return GroupMapper.toDomain(group);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findById(input: {
    groupId: string;
    viewerId?: string;
  }): Promise<Group | null> {
    const client = this.getClient();
    const group = await client.group.findFirst({
      where: {
        id: input.groupId,
        deletedAt: null,
      },
      include: GroupMapper.includeForViewer(input.viewerId),
    });

    return group ? GroupMapper.toDomain(group) : null;
  }

  async listPage(input: ListGroupsInput): Promise<ListGroupsPage> {
    const client = this.getClient();
    const groups = await client.group.findMany({
      where: {
        deletedAt: null,
        ...this.getSearchWhere(input.search),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : undefined,
      include: GroupMapper.includeForViewer(input.viewerId),
    });
    const hasNextPage = groups.length > input.limit;
    const items = hasNextPage ? groups.slice(0, input.limit) : groups;

    return {
      items: items.map((group) => GroupMapper.toDomain(group)),
      nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
    };
  }

  async findMembership(input: {
    groupId: string;
    userId: string;
  }): Promise<GroupMembership | null> {
    const client = this.getClient();
    const membership = await client.groupMember.findUnique({
      where: {
        groupId_userId: input,
      },
    });

    return membership
      ? {
          groupId: membership.groupId,
          userId: membership.userId,
          role: membership.role,
        }
      : null;
  }

  async findPendingJoinRequest(input: {
    groupId: string;
    requesterId: string;
  }): Promise<GroupJoinRequest | null> {
    const client = this.getClient();
    const request = await client.groupJoinRequest.findFirst({
      where: {
        ...input,
        status: GroupJoinRequestStatus.PENDING,
      },
    });

    return request ? GroupMapper.toJoinRequestDomain(request) : null;
  }

  async addMember(input: {
    groupId: string;
    userId: string;
    role: GroupMemberRole;
  }): Promise<GroupMembership> {
    try {
      const membership = await this.runTransaction(async (tx) => {
        const member = await tx.groupMember.upsert({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId: input.userId,
            },
          },
          create: input,
          update: {},
        });

        await tx.group.update({
          where: { id: input.groupId },
          data: { memberCount: { increment: 1 } },
        });

        return member;
      });

      return {
        groupId: membership.groupId,
        userId: membership.userId,
        role: membership.role,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async createJoinRequest(input: {
    groupId: string;
    requesterId: string;
  }): Promise<GroupJoinRequest> {
    const client = this.getClient();

    try {
      const request = await client.groupJoinRequest.upsert({
        where: {
          groupId_requesterId: input,
        },
        create: input,
        update: {
          status: GroupJoinRequestStatus.PENDING,
        },
      });

      return GroupMapper.toJoinRequestDomain(request);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async listJoinRequests(groupId: string): Promise<GroupJoinRequest[]> {
    const client = this.getClient();

    const requests = await client.groupJoinRequest.findMany({
      where: {
        groupId,
        status: GroupJoinRequestStatus.PENDING,
      },
      include: {
        requester: {
          select: GROUP_USER_SELECT,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => GroupMapper.toJoinRequestDomain(request));
  }

  async updateJoinRequest(input: {
    requestId: string;
    groupId: string;
    status: Extract<GroupJoinRequestStatus, 'APPROVED' | 'REJECTED'>;
  }): Promise<GroupJoinRequest> {
    try {
      return await this.runTransaction(async (tx) => {
        const existingRequest = await tx.groupJoinRequest.findFirst({
          where: {
            id: input.requestId,
            groupId: input.groupId,
            status: GroupJoinRequestStatus.PENDING,
          },
        });

        if (!existingRequest) {
          throw new DomainError(
            ErrorCode.RESOURCE_NOT_FOUND,
            'Group join request not found',
            404,
          );
        }

        const request = await tx.groupJoinRequest.update({
          where: { id: input.requestId },
          data: { status: input.status },
        });

        if (input.status === GroupJoinRequestStatus.APPROVED) {
          await tx.groupMember.upsert({
            where: {
              groupId_userId: {
                groupId: input.groupId,
                userId: existingRequest.requesterId,
              },
            },
            create: {
              groupId: input.groupId,
              userId: existingRequest.requesterId,
              role: GroupMemberRole.MEMBER,
            },
            update: {},
          });

          await tx.group.update({
            where: { id: input.groupId },
            data: { memberCount: { increment: 1 } },
          });
        }

        return GroupMapper.toJoinRequestDomain(request);
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw mapPrismaError(error);
    }
  }

  async listMembers(groupId: string): Promise<GroupMember[]> {
    const client = this.getClient();
    const members = await client.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: GROUP_USER_SELECT,
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }, { userId: 'asc' }],
    });

    return members.map((member) => GroupMapper.toMemberDomain(member));
  }

  async listManagers(groupId: string): Promise<GroupMember[]> {
    const client = this.getClient();
    const members = await client.groupMember.findMany({
      where: {
        groupId,
        role: {
          in: [GroupMemberRole.OWNER, GroupMemberRole.ADMIN],
        },
      },
      include: {
        user: {
          select: GROUP_USER_SELECT,
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }, { userId: 'asc' }],
    });

    return members.map((member) => GroupMapper.toMemberDomain(member));
  }

  async listMedia(input: {
    groupId: string;
    limit: number;
    cursor?: string;
  }): Promise<{
    items: ReturnType<typeof GroupMapper.toMediaDomain>[];
    nextCursor: string | null;
  }> {
    const client = this.getClient();
    const cursorMedia = input.cursor
      ? await client.media.findUnique({
          where: { id: input.cursor },
          select: {
            id: true,
            order: true,
            post: {
              select: {
                createdAt: true,
              },
            },
          },
        })
      : null;

    const mediaItems = await client.media.findMany({
      where: {
        post: {
          groupId: input.groupId,
          deletedAt: null,
          isHidden: false,
        },
        ...(cursorMedia
          ? {
              OR: [
                { post: { createdAt: { lt: cursorMedia.post.createdAt } } },
                {
                  post: { createdAt: cursorMedia.post.createdAt },
                  order: { gt: cursorMedia.order },
                },
                {
                  post: { createdAt: cursorMedia.post.createdAt },
                  order: cursorMedia.order,
                  id: { gt: cursorMedia.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        { post: { createdAt: 'desc' } },
        { order: 'asc' },
        { id: 'asc' },
      ],
      take: input.limit + 1,
      include: {
        post: {
          select: {
            id: true,
            createdAt: true,
            author: {
              select: GROUP_USER_SELECT,
            },
          },
        },
      },
    });
    const hasNextPage = mediaItems.length > input.limit;
    const items = hasNextPage ? mediaItems.slice(0, input.limit) : mediaItems;

    return {
      items: items.map((media) => GroupMapper.toMediaDomain(media)),
      nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
    };
  }

  async updateMemberRole(input: {
    groupId: string;
    userId: string;
    role: Extract<GroupMemberRole, 'ADMIN' | 'MEMBER'>;
  }): Promise<GroupMember> {
    const client = this.getClient();

    try {
      const member = await client.groupMember.update({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
        data: {
          role: input.role,
        },
        include: {
          user: {
            select: GROUP_USER_SELECT,
          },
        },
      });

      return GroupMapper.toMemberDomain(member);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updatePrivacy(input: {
    groupId: string;
    viewerId: string;
    privacy: Prisma.GroupUncheckedUpdateInput['privacy'];
  }): Promise<Group> {
    const client = this.getClient();

    try {
      const group = await client.group.update({
        where: {
          id: input.groupId,
          deletedAt: null,
        },
        data: {
          privacy: input.privacy,
        },
        include: GroupMapper.includeForViewer(input.viewerId),
      });

      return GroupMapper.toDomain(group);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async removeMember(input: {
    groupId: string;
    userId: string;
  }): Promise<void> {
    try {
      await this.runTransaction(async (tx) => {
        await tx.groupMember.delete({
          where: {
            groupId_userId: {
              groupId: input.groupId,
              userId: input.userId,
            },
          },
        });

        await tx.group.update({
          where: { id: input.groupId },
          data: { memberCount: { decrement: 1 } },
        });
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private getSearchWhere(search?: string): Prisma.GroupWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private async createUniqueSlug(
    client: PrismaClientLike,
    name: string,
  ): Promise<string> {
    const baseSlug = this.slugify(name);

    for (let index = 0; index < 20; index += 1) {
      const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
      const existingGroup = await client.group.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existingGroup) {
        return slug;
      }
    }

    return `${baseSlug}-${Date.now()}`;
  }

  private slugify(value: string): string {
    return (
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'group'
    );
  }
}
