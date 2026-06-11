export type FanOutPostFeedPageJobInput = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export abstract class PostFeedJobQueue {
  abstract enqueueFanOutPage(input: FanOutPostFeedPageJobInput): Promise<void>;
}
