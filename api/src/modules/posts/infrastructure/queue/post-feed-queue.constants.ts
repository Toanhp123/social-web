export const POST_FEED_QUEUE_NAME = 'post-feed';

export const POST_FEED_JOB_NAMES = {
  fanOutPage: 'fan-out-page',
} as const;

export type PostFeedJobName =
  (typeof POST_FEED_JOB_NAMES)[keyof typeof POST_FEED_JOB_NAMES];

export type FanOutPostFeedPageJobData = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export type PostFeedJobData = FanOutPostFeedPageJobData;
