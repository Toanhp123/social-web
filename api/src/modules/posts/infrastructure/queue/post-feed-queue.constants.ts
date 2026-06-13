export const POST_FEED_QUEUE_NAME = 'post-feed';

export const POST_FEED_JOB_NAMES = {
  fanOutPage: 'fan-out-page',
  backfillRelationshipPage: 'backfill-relationship-page',
  removeRelationshipPage: 'remove-relationship-page',
  removePostPage: 'remove-post-page',
} as const;

export type PostFeedJobName =
  (typeof POST_FEED_JOB_NAMES)[keyof typeof POST_FEED_JOB_NAMES];

export type FanOutPostFeedPageJobData = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export type RelationshipFeedPageJobData = {
  recipientId: string;
  sourceUserId: string;
  reason: 'FOLLOWING' | 'FRIEND_ACTIVITY';
  cursor?: string;
};

export type BackfillRelationshipFeedPageJobData = RelationshipFeedPageJobData;
export type RemoveRelationshipFeedPageJobData = RelationshipFeedPageJobData;

export type RemovePostFeedPageJobData = {
  postId: string;
  cursor?: string;
};

export type PostFeedJobData =
  | FanOutPostFeedPageJobData
  | RelationshipFeedPageJobData
  | RemovePostFeedPageJobData;
