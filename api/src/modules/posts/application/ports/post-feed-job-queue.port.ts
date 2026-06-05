export type PostCreatedFeedJobInput = {
  postId: string;
  authorId: string;
};

export abstract class PostFeedJobQueue {
  abstract enqueuePostCreated(input: PostCreatedFeedJobInput): Promise<void>;
}
