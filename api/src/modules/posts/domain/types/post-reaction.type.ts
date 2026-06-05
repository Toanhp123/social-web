import { ReactionType } from '@/generated/prisma/client.js';

export type SetPostReactionInput = {
  postId: string;
  userId: string;
  type: ReactionType;
};

export type RemovePostReactionInput = {
  postId: string;
  userId: string;
};
