import { Injectable } from '@nestjs/common';
import {
  FeedReason,
  PostVisibility,
  type Prisma,
} from '@/generated/prisma/client.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { PrismaTransactionContext } from '@/infrastructure/database/prisma-transaction-context.js';
import {
  FeedRecipient,
  FanOutRecipientPage,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import type {
  FanOutPostInput,
  FeedRecipientReason,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';
import { PostMapper } from '@/modules/posts/infrastructure/persistence/mappers/post.mapper.js';

type PrismaClientLike = Prisma.TransactionClient | PrismaService;
type FanOutCursorStage =
  | 'author'
  | 'friends-user1'
  | 'friends-user2'
  | 'followers';

const FIRST_FAN_OUT_STAGE: FanOutCursorStage = 'author';

@Injectable()
export class PrismaPostFeedRepository implements PostFeedRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txContext: PrismaTransactionContext,
  ) {}

  private getClient(): PrismaClientLike {
    return this.txContext.getClient() ?? this.prisma;
  }

  async findFanOutRecipientPage(
    input: FanOutPostInput & { limit: number },
  ): Promise<FanOutRecipientPage> {
    const client = this.getClient();

    try {
      const post = await client.post.findFirst({
        where: {
          id: input.postId,
          authorId: input.authorId,
          deletedAt: null,
          isHidden: false,
        },
        select: {
          id: true,
          authorId: true,
          visibility: true,
        },
      });

      if (!post) {
        return { items: [], nextCursor: null };
      }

      return await this.buildRecipientPage(client, {
        postId: post.id,
        authorId: post.authorId,
        visibility: post.visibility,
        cursor: input.cursor,
        limit: input.limit,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async createFeedItems(input: {
    postId: string;
    recipients: FeedRecipient[];
  }): Promise<number> {
    const client = this.getClient();

    try {
      const result = await client.feed.createMany({
        data: input.recipients.map((recipient) => ({
          userId: recipient.userId,
          postId: input.postId,
          reason: this.toPrismaFeedReason(recipient.reason),
          score: 0,
        })),
        skipDuplicates: true,
      });

      return result.count;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findPage(
    query: ListPostsQuery & { viewerId: string },
  ): Promise<ListPostsPage> {
    const client = this.getClient();

    try {
      const feedItems = await client.feed.findMany({
        where: {
          userId: query.viewerId,
          ...(query.cursor
            ? {
                OR: [
                  { createdAt: { lt: query.cursor.createdAt } },
                  {
                    createdAt: query.cursor.createdAt,
                    postId: { lt: query.cursor.id },
                  },
                ],
              }
            : {}),
          post: {
            deletedAt: null,
            isHidden: false,
          },
        },
        orderBy: [{ createdAt: 'desc' }, { postId: 'desc' }],
        take: query.limit + 1,
        include: {
          post: {
            include: PostMapper.includeForViewer(query.viewerId),
          },
        },
      });
      const hasNextPage = feedItems.length > query.limit;
      const pageItems = hasNextPage
        ? feedItems.slice(0, query.limit)
        : feedItems;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((feedItem) => PostMapper.toDomain(feedItem.post)),
        nextCursor:
          hasNextPage && lastItem
            ? { createdAt: lastItem.createdAt, id: lastItem.postId }
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private async buildRecipientPage(
    client: PrismaClientLike,
    input: {
      postId: string;
      authorId: string;
      visibility: PostVisibility;
      cursor?: string;
      limit: number;
    },
  ): Promise<FanOutRecipientPage> {
    const cursor = this.parseFanOutCursor(input.cursor);
    const recipients: FeedRecipient[] = [];
    let stage: FanOutCursorStage | null = cursor.stage;
    let afterUserId = cursor.afterUserId;

    while (stage && recipients.length < input.limit) {
      const remaining = input.limit - recipients.length;
      const page = await this.findStageRecipientPage(client, {
        authorId: input.authorId,
        visibility: input.visibility,
        stage,
        afterUserId,
        limit: remaining,
      });

      recipients.push(...page.items);

      if (page.nextCursor) {
        return {
          items: recipients,
          nextCursor: page.nextCursor,
        };
      }

      stage = this.getNextStage(stage, input.visibility);
      afterUserId = null;
    }

    return {
      items: recipients,
      nextCursor: null,
    };
  }

  private async findStageRecipientPage(
    client: PrismaClientLike,
    input: {
      authorId: string;
      visibility: PostVisibility;
      stage: FanOutCursorStage;
      afterUserId: string | null;
      limit: number;
    },
  ): Promise<FanOutRecipientPage> {
    if (input.stage === 'author') {
      return {
        items: input.afterUserId
          ? []
          : [{ userId: input.authorId, reason: null }],
        nextCursor: null,
      };
    }

    if (
      input.visibility === PostVisibility.PRIVATE ||
      (input.stage === 'followers' &&
        input.visibility !== PostVisibility.PUBLIC)
    ) {
      return { items: [], nextCursor: null };
    }

    if (input.stage === 'friends-user1') {
      return this.findFriendStageRecipientPage(client, {
        authorId: input.authorId,
        authorSide: 'user1Id',
        friendSide: 'user2Id',
        afterUserId: input.afterUserId,
        limit: input.limit,
      });
    }

    if (input.stage === 'friends-user2') {
      return this.findFriendStageRecipientPage(client, {
        authorId: input.authorId,
        authorSide: 'user2Id',
        friendSide: 'user1Id',
        afterUserId: input.afterUserId,
        limit: input.limit,
      });
    }

    return this.findFollowerRecipientPage(client, {
      authorId: input.authorId,
      afterUserId: input.afterUserId,
      limit: input.limit,
    });
  }

  private async findFriendStageRecipientPage(
    client: PrismaClientLike,
    input: {
      authorId: string;
      authorSide: 'user1Id' | 'user2Id';
      friendSide: 'user1Id' | 'user2Id';
      afterUserId: string | null;
      limit: number;
    },
  ): Promise<FanOutRecipientPage> {
    const friendships = await client.friendship.findMany({
      where: {
        [input.authorSide]: input.authorId,
        ...(input.afterUserId
          ? { [input.friendSide]: { gt: input.afterUserId } }
          : {}),
      },
      orderBy: { [input.friendSide]: 'asc' },
      take: input.limit + 1,
      select: {
        [input.friendSide]: true,
      },
    });
    const hasNextPage = friendships.length > input.limit;
    const pageItems = hasNextPage
      ? friendships.slice(0, input.limit)
      : friendships;
    const recipients = pageItems.map((friendship) => ({
      userId: friendship[input.friendSide],
      reason: 'FRIEND_ACTIVITY' as const,
    }));
    const lastRecipient = recipients.at(-1);

    return {
      items: recipients,
      nextCursor:
        hasNextPage && lastRecipient
          ? this.encodeFanOutCursor(
              input.authorSide === 'user1Id'
                ? 'friends-user1'
                : 'friends-user2',
              lastRecipient.userId,
            )
          : null,
    };
  }

  private async findFollowerRecipientPage(
    client: PrismaClientLike,
    input: {
      authorId: string;
      afterUserId: string | null;
      limit: number;
    },
  ): Promise<FanOutRecipientPage> {
    const followers = await client.follow.findMany({
      where: {
        followingId: input.authorId,
        ...(input.afterUserId ? { followerId: { gt: input.afterUserId } } : {}),
      },
      orderBy: { followerId: 'asc' },
      take: input.limit + 1,
      select: {
        followerId: true,
      },
    });
    const hasNextPage = followers.length > input.limit;
    const pageItems = hasNextPage ? followers.slice(0, input.limit) : followers;
    const recipients = pageItems.map((follow) => ({
      userId: follow.followerId,
      reason: 'FOLLOWING' as const,
    }));
    const lastRecipient = recipients.at(-1);

    return {
      items: recipients,
      nextCursor:
        hasNextPage && lastRecipient
          ? this.encodeFanOutCursor('followers', lastRecipient.userId)
          : null,
    };
  }

  private getNextStage(
    stage: FanOutCursorStage,
    visibility: PostVisibility,
  ): FanOutCursorStage | null {
    if (stage === 'author') {
      return visibility === PostVisibility.PRIVATE ? null : 'friends-user1';
    }

    if (stage === 'friends-user1') {
      return visibility === PostVisibility.PRIVATE ? null : 'friends-user2';
    }

    if (stage === 'friends-user2') {
      return visibility === PostVisibility.PUBLIC ? 'followers' : null;
    }

    return null;
  }

  private parseFanOutCursor(cursor?: string): {
    stage: FanOutCursorStage;
    afterUserId: string | null;
  } {
    if (!cursor) {
      return { stage: FIRST_FAN_OUT_STAGE, afterUserId: null };
    }

    const [stage, afterUserId] = cursor.split(':', 2);

    if (!this.isFanOutCursorStage(stage)) {
      return { stage: FIRST_FAN_OUT_STAGE, afterUserId: null };
    }

    return { stage, afterUserId: afterUserId || null };
  }

  private encodeFanOutCursor(
    stage: FanOutCursorStage,
    afterUserId: string,
  ): string {
    return `${stage}:${afterUserId}`;
  }

  private isFanOutCursorStage(stage: string): stage is FanOutCursorStage {
    return (
      stage === 'author' ||
      stage === 'friends-user1' ||
      stage === 'friends-user2' ||
      stage === 'followers'
    );
  }

  private toPrismaFeedReason(reason: FeedRecipientReason): FeedReason | null {
    if (!reason) {
      return null;
    }

    return reason === 'FRIEND_ACTIVITY'
      ? FeedReason.FRIEND_ACTIVITY
      : FeedReason.FOLLOWING;
  }
}
