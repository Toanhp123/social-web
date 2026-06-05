export const POST_FEED_QUEUE_NAME = 'post-feed';

export const POST_FEED_JOB_NAMES = {
  postCreated: 'post-created',
} as const;

export type PostFeedJobName =
  (typeof POST_FEED_JOB_NAMES)[keyof typeof POST_FEED_JOB_NAMES];

export type PostCreatedFeedJobData = {
  postId: string;
  authorId: string;
};

export type PostFeedJobData = PostCreatedFeedJobData;
