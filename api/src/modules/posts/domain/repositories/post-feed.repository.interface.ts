import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';

export type FanOutPostInput = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export type BackfillRelationshipFeedInput = {
  recipientId: string;
  sourceUserId: string;
  reason: RelationshipFeedReason;
  cursor?: string;
};

export type DeleteRelationshipFeedItemsInput = {
  recipientId: string;
  sourceUserId: string;
  reason: RelationshipFeedReason;
  cursor?: string;
};

export type RelationshipFeedReason = 'FOLLOWING' | 'FRIEND_ACTIVITY';
export type FeedRecipientReason =
  | 'AUTHOR'
  | RelationshipFeedReason
  | 'TRENDING';

export type FeedRecipient = {
  userId: string;
  reason: FeedRecipientReason;
};

export type FanOutRecipientPage = {
  items: FeedRecipient[];
  nextCursor: string | null;
};

export type BackfillFeedPost = {
  postId: string;
  createdAt: Date;
  reason: Exclude<FeedRecipientReason, 'AUTHOR'>;
};

export type BackfillFeedPostPage = {
  items: BackfillFeedPost[];
  nextCursor: string | null;
};

export type DeleteFeedItem = {
  postId: string;
  createdAt: Date;
};

export type DeleteFeedItemPage = {
  items: DeleteFeedItem[];
  nextCursor: string | null;
};

export type DeletePostFeedItemsInput = {
  postId: string;
  cursor?: string;
};

export type DeletePostFeedItem = {
  userId: string;
  createdAt: Date;
};

export type DeletePostFeedItemPage = {
  items: DeletePostFeedItem[];
  nextCursor: string | null;
};

export abstract class PostFeedRepository {
  abstract findFanOutRecipientPage(
    input: FanOutPostInput & { limit: number },
  ): Promise<FanOutRecipientPage>;
  abstract findRelationshipBackfillPostPage(
    input: BackfillRelationshipFeedInput & { limit: number },
  ): Promise<BackfillFeedPostPage>;
  abstract createFeedItems(input: {
    postId: string;
    recipients: FeedRecipient[];
  }): Promise<number>;
  abstract createFeedItemsForRecipient(input: {
    recipientId: string;
    posts: BackfillFeedPost[];
  }): Promise<number>;
  abstract findRelationshipFeedItemPage(
    input: DeleteRelationshipFeedItemsInput & { limit: number },
  ): Promise<DeleteFeedItemPage>;
  abstract deleteFeedItemsForRecipient(input: {
    recipientId: string;
    postIds: string[];
  }): Promise<number>;
  abstract findPostFeedItemPage(
    input: DeletePostFeedItemsInput & { limit: number },
  ): Promise<DeletePostFeedItemPage>;
  abstract deleteFeedItemsForPost(input: {
    postId: string;
    userIds: string[];
  }): Promise<number>;
  abstract findPage(
    query: ListPostsQuery & { viewerId: string },
  ): Promise<ListPostsPage>;
}
