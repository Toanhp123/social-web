import { FriendRequestStatus } from '@/generated/prisma/client.js';
import { FriendUser } from '@/modules/friends/domain/entities/friend-user.entity.js';

export class FriendRequest {
  constructor(
    public readonly id: string,
    public readonly requester: FriendUser,
    public readonly receiver: FriendUser,
    public readonly status: FriendRequestStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
