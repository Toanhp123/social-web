import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';
import {
  ListFriendsInput,
  RemoveFriendInput,
} from '@/modules/friends/domain/types/friend.type.js';

export abstract class FriendshipRepository {
  abstract removeFriend(input: RemoveFriendInput): Promise<void>;

  abstract listFriends(input: ListFriendsInput): Promise<Friendship[]>;
}
