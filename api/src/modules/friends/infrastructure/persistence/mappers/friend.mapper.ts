import { Prisma } from '@/generated/prisma/client.js';
import { FriendRequest } from '@/modules/friends/domain/entities/friend-request.entity.js';
import { FriendUser } from '@/modules/friends/domain/entities/friend-user.entity.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';

const FRIEND_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
} as const;

export const FRIEND_REQUEST_INCLUDE = {
  requester: {
    select: FRIEND_USER_SELECT,
  },
  receiver: {
    select: FRIEND_USER_SELECT,
  },
} as const;

export type FriendRequestPayload = Prisma.FriendRequestGetPayload<{
  include: typeof FRIEND_REQUEST_INCLUDE;
}>;

type FriendshipUserPayload = Prisma.UserGetPayload<{
  select: typeof FRIEND_USER_SELECT;
}>;

export class FriendMapper {
  static readonly friendUserSelect = FRIEND_USER_SELECT;
  static readonly requestInclude = FRIEND_REQUEST_INCLUDE;

  static toRequestDomain(request: FriendRequestPayload): FriendRequest {
    return new FriendRequest(
      request.id,
      FriendMapper.toUserDomain(request.requester),
      FriendMapper.toUserDomain(request.receiver),
      request.status,
      request.createdAt,
      request.updatedAt,
    );
  }

  static toFriendshipDomain(
    user: FriendshipUserPayload,
    createdAt: Date,
  ): Friendship {
    return new Friendship(FriendMapper.toUserDomain(user), createdAt);
  }

  private static toUserDomain(user: FriendshipUserPayload): FriendUser {
    return new FriendUser(
      user.id,
      user.fullName,
      user.username,
      user.avatarUrl,
    );
  }
}
