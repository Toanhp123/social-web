import { Follow } from '@/modules/follows/domain/entities/follow.entity.js';
import { FollowStatus } from '@/modules/follows/domain/entities/follow-status.entity.js';
import {
  FollowUserInput,
  ListFollowsInput,
} from '@/modules/follows/domain/types/follow.type.js';

export abstract class FollowRepository {
  abstract follow(input: FollowUserInput): Promise<FollowStatus>;

  abstract unfollow(input: FollowUserInput): Promise<FollowStatus>;

  abstract getStatus(input: FollowUserInput): Promise<FollowStatus>;

  abstract listFollowers(input: ListFollowsInput): Promise<Follow[]>;

  abstract listFollowing(input: ListFollowsInput): Promise<Follow[]>;
}
