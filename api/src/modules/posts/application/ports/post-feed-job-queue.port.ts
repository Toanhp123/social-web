export type FanOutPostFeedPageJobInput = {
  postId: string;
  authorId: string;
  cursor?: string;
};

export type BackfillRelationshipFeedPageJobInput = {
  recipientId: string;
  sourceUserId: string;
  reason: 'FOLLOWING' | 'FRIEND_ACTIVITY';
  cursor?: string;
};

export type RemoveRelationshipFeedPageJobInput =
  BackfillRelationshipFeedPageJobInput;

export abstract class PostFeedJobQueue {
  abstract enqueueFanOutPage(input: FanOutPostFeedPageJobInput): Promise<void>;
  abstract enqueueRelationshipBackfillPage(
    input: BackfillRelationshipFeedPageJobInput,
  ): Promise<void>;
  abstract enqueueRelationshipRemovalPage(
    input: RemoveRelationshipFeedPageJobInput,
  ): Promise<void>;
}
