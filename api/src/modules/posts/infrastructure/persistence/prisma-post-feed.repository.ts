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
  BackfillFeedPostPage,
  DeletePostFeedItemPage,
  DeleteFeedItemPage,
  FeedRecipient,
  FanOutRecipientPage,
  PostFeedRepository,
} from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import type {
  BackfillRelationshipFeedInput,
  DeletePostFeedItemsInput,
  DeleteRelationshipFeedItemsInput,
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

  async findRelationshipBackfillPostPage(
    input: BackfillRelationshipFeedInput & { limit: number },
  ): Promise<BackfillFeedPostPage> {
    const client = this.getClient();

    try {
      const cursor = this.parsePostCursor(input.cursor);
      const posts = await client.post.findMany({
        where: {
          authorId: input.sourceUserId,
          deletedAt: null,
          isHidden: false,
          visibility:
            input.reason === 'FOLLOWING'
              ? PostVisibility.PUBLIC
              : { in: [PostVisibility.PUBLIC, PostVisibility.FRIENDS_ONLY] },
          ...(cursor
            ? {
                OR: [
                  { createdAt: { lt: cursor.createdAt } },
                  {
                    createdAt: cursor.createdAt,
                    id: { lt: cursor.id },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: input.limit + 1,
        select: {
          id: true,
          createdAt: true,
        },
      });
      const hasNextPage = posts.length > input.limit;
      const pageItems = hasNextPage ? posts.slice(0, input.limit) : posts;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((post) => ({
          postId: post.id,
          createdAt: post.createdAt,
          reason: input.reason,
        })),
        nextCursor:
          hasNextPage && lastItem
            ? this.encodePostCursor({
                createdAt: lastItem.createdAt,
                id: lastItem.id,
              })
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async createFeedItemsForRecipient(input: {
    recipientId: string;
    posts: Array<{
      postId: string;
      reason: Exclude<FeedRecipientReason, 'AUTHOR'>;
    }>;
  }): Promise<number> {
    const client = this.getClient();

    try {
      const result = await client.feed.createMany({
        data: input.posts.map((post) => ({
          userId: input.recipientId,
          postId: post.postId,
          reason: this.toPrismaFeedReason(post.reason),
          score: 0,
        })),
        skipDuplicates: true,
      });

      return result.count;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findRelationshipFeedItemPage(
    input: DeleteRelationshipFeedItemsInput & { limit: number },
  ): Promise<DeleteFeedItemPage> {
    const client = this.getClient();

    try {
      const cursor = this.parsePostCursor(input.cursor);
      const feedItems = await client.feed.findMany({
        where: {
          userId: input.recipientId,
          reason: this.toPrismaFeedReason(input.reason),
          ...(cursor
            ? {
                OR: [
                  { createdAt: { lt: cursor.createdAt } },
                  {
                    createdAt: cursor.createdAt,
                    postId: { lt: cursor.id },
                  },
                ],
              }
            : {}),
          post: {
            authorId: input.sourceUserId,
          },
        },
        orderBy: [{ createdAt: 'desc' }, { postId: 'desc' }],
        take: input.limit + 1,
        select: {
          postId: true,
          createdAt: true,
        },
      });
      const hasNextPage = feedItems.length > input.limit;
      const pageItems = hasNextPage
        ? feedItems.slice(0, input.limit)
        : feedItems;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((item) => ({
          postId: item.postId,
          createdAt: item.createdAt,
        })),
        nextCursor:
          hasNextPage && lastItem
            ? this.encodePostCursor({
                createdAt: lastItem.createdAt,
                id: lastItem.postId,
              })
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async deleteFeedItemsForRecipient(input: {
    recipientId: string;
    postIds: string[];
  }): Promise<number> {
    if (input.postIds.length === 0) {
      return 0;
    }

    const client = this.getClient();

    try {
      const result = await client.feed.deleteMany({
        where: {
          userId: input.recipientId,
          postId: {
            in: input.postIds,
          },
        },
      });

      return result.count;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findPostFeedItemPage(
    input: DeletePostFeedItemsInput & { limit: number },
  ): Promise<DeletePostFeedItemPage> {
    const client = this.getClient();

    try {
      const cursor = this.parsePostFeedCursor(input.cursor);
      const feedItems = await client.feed.findMany({
        where: {
          postId: input.postId,
          ...(cursor
            ? {
                OR: [
                  { createdAt: { lt: cursor.createdAt } },
                  {
                    createdAt: cursor.createdAt,
                    userId: { lt: cursor.userId },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { userId: 'desc' }],
        take: input.limit + 1,
        select: {
          userId: true,
          createdAt: true,
        },
      });
      const hasNextPage = feedItems.length > input.limit;
      const pageItems = hasNextPage
        ? feedItems.slice(0, input.limit)
        : feedItems;
      const lastItem = pageItems.at(-1);

      return {
        items: pageItems.map((item) => ({
          userId: item.userId,
          createdAt: item.createdAt,
        })),
        nextCursor:
          hasNextPage && lastItem
            ? this.encodePostFeedCursor({
                createdAt: lastItem.createdAt,
                userId: lastItem.userId,
              })
            : null,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async deleteFeedItemsForPost(input: {
    postId: string;
    userIds: string[];
  }): Promise<number> {
    if (input.userIds.length === 0) {
      return 0;
    }

    const client = this.getClient();

    try {
      const result = await client.feed.deleteMany({
        where: {
          postId: input.postId,
          userId: {
            in: input.userIds,
          },
        },
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
          : [{ userId: input.authorId, reason: 'AUTHOR' }],
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

  private encodePostCursor(input: { createdAt: Date; id: string }): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: input.createdAt.toISOString(),
        id: input.id,
      }),
      'utf8',
    ).toString('base64url');
  }

  private parsePostCursor(
    cursor?: string,
  ): { createdAt: Date; id: string } | null {
    if (!cursor) {
      return null;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; id?: unknown };

      if (
        typeof decoded.createdAt !== 'string' ||
        typeof decoded.id !== 'string'
      ) {
        return null;
      }

      const createdAt = new Date(decoded.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        return null;
      }

      return { createdAt, id: decoded.id };
    } catch {
      return null;
    }
  }

  private encodePostFeedCursor(input: {
    createdAt: Date;
    userId: string;
  }): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: input.createdAt.toISOString(),
        userId: input.userId,
      }),
      'utf8',
    ).toString('base64url');
  }

  private parsePostFeedCursor(
    cursor?: string,
  ): { createdAt: Date; userId: string } | null {
    if (!cursor) {
      return null;
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: unknown; userId?: unknown };

      if (
        typeof decoded.createdAt !== 'string' ||
        typeof decoded.userId !== 'string'
      ) {
        return null;
      }

      const createdAt = new Date(decoded.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        return null;
      }

      return { createdAt, userId: decoded.userId };
    } catch {
      return null;
    }
  }

  private toPrismaFeedReason(reason: FeedRecipientReason): FeedReason {
    if (reason === 'AUTHOR') {
      return FeedReason.AUTHOR;
    }

    if (reason === 'TRENDING') {
      return FeedReason.TRENDING;
    }

    return reason === 'FRIEND_ACTIVITY'
      ? FeedReason.FRIEND_ACTIVITY
      : FeedReason.FOLLOWING;
  }
}
