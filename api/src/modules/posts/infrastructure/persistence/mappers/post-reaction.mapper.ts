import { ReactionType, type Prisma } from '@/generated/prisma/client.js';
import {
  RemovePostReactionInput,
  SetPostReactionInput,
} from '@/modules/posts/domain/types/post-reaction.type.js';

type ReactionCountField =
  | 'likeCount'
  | 'loveCount'
  | 'hahaCount'
  | 'wowCount'
  | 'sadCount'
  | 'angryCount';

const REACTION_COUNT_FIELD: Record<ReactionType, ReactionCountField> = {
  LIKE: 'likeCount',
  LOVE: 'loveCount',
  HAHA: 'hahaCount',
  WOW: 'wowCount',
  SAD: 'sadCount',
  ANGRY: 'angryCount',
};

export class PostReactionMapper {
  static toUniqueWhere(
    input: SetPostReactionInput | RemovePostReactionInput,
  ): Prisma.ReactionWhereUniqueInput {
    return {
      userId_postId: {
        userId: input.userId,
        postId: input.postId,
      },
    };
  }

  static toPersistence(
    input: SetPostReactionInput,
  ): Prisma.ReactionUncheckedCreateInput {
    return {
      userId: input.userId,
      postId: input.postId,
      type: input.type,
    };
  }

  static toRestoreData(type: ReactionType): Prisma.ReactionUpdateInput {
    return {
      type,
      deletedAt: null,
    };
  }

  static toChangeTypeData(type: ReactionType): Prisma.ReactionUpdateInput {
    return { type };
  }

  static toSoftDeleteData(deletedAt = new Date()): Prisma.ReactionUpdateInput {
    return { deletedAt };
  }

  static toVisiblePostWhere(
    postId: string,
    viewerId: string,
  ): Prisma.PostWhereInput {
    return {
      id: postId,
      deletedAt: null,
      isHidden: false,
      OR: [{ visibility: 'PUBLIC' }, { authorId: viewerId }],
    };
  }

  static toStatsDeltaData(
    type: ReactionType,
    delta: 1 | -1,
    includeTotal = true,
  ): Prisma.PostStatsUpdateInput {
    return {
      [REACTION_COUNT_FIELD[type]]:
        delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) },
      ...(includeTotal
        ? {
            totalReactionCount:
              delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) },
          }
        : undefined),
    };
  }
}
