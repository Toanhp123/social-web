import { FollowUser } from './follow-user.entity.js';

export class Follow {
  constructor(
    public readonly user: FollowUser,
    public readonly createdAt: Date,
  ) {}
}
