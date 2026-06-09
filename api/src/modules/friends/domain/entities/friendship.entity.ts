import { FriendUser } from '@/modules/friends/domain/entities/friend-user.entity.js';

export class Friendship {
  constructor(
    public readonly user: FriendUser,
    public readonly createdAt: Date,
  ) {}
}
