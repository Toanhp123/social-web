import { Prisma } from '@/generated/prisma/client.js';
import { Follow } from '@/modules/follows/domain/entities/follow.entity.js';
import { FollowUser } from '@/modules/follows/domain/entities/follow-user.entity.js';

const FOLLOW_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
} as const;

export const FOLLOW_INCLUDE = {
  follower: {
    select: FOLLOW_USER_SELECT,
  },
  following: {
    select: FOLLOW_USER_SELECT,
  },
} as const;

export type FollowPayload = Prisma.FollowGetPayload<{
  include: typeof FOLLOW_INCLUDE;
}>;

type FollowUserPayload = Prisma.UserGetPayload<{
  select: typeof FOLLOW_USER_SELECT;
}>;

export class FollowMapper {
  static readonly userSelect = FOLLOW_USER_SELECT;
  static readonly include = FOLLOW_INCLUDE;

  static toFollowerDomain(follow: FollowPayload): Follow {
    return new Follow(
      FollowMapper.toUserDomain(follow.follower),
      follow.createdAt,
    );
  }

  static toFollowingDomain(follow: FollowPayload): Follow {
    return new Follow(
      FollowMapper.toUserDomain(follow.following),
      follow.createdAt,
    );
  }

  private static toUserDomain(user: FollowUserPayload): FollowUser {
    return new FollowUser(
      user.id,
      user.fullName,
      user.username,
      user.avatarUrl,
    );
  }
}
