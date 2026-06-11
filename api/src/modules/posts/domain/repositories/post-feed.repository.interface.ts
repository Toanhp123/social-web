import {
  ListPostsPage,
  ListPostsQuery,
} from '@/modules/posts/domain/types/list-posts-query.type.js';

export type FanOutPostInput = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export type FeedRecipientReason = 'FOLLOWING' | 'FRIEND_ACTIVITY' | null;

export type FeedRecipient = {
  userId: string;
  reason: FeedRecipientReason;
};

export type FanOutRecipientPage = {
  items: FeedRecipient[];
  nextCursor: string | null;
};

export abstract class PostFeedRepository {
  abstract findFanOutRecipientPage(
    input: FanOutPostInput & { limit: number },
  ): Promise<FanOutRecipientPage>;
  abstract createFeedItems(input: {
    postId: string;
    recipients: FeedRecipient[];
  }): Promise<number>;
  abstract findPage(
    query: ListPostsQuery & { viewerId: string },
  ): Promise<ListPostsPage>;
}
