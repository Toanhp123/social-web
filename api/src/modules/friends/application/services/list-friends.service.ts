import { Inject, Injectable } from '@nestjs/common';
import { FRIENDSHIP_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { Friendship } from '@/modules/friends/domain/entities/friendship.entity.js';
import { ListFriendsInput } from '@/modules/friends/domain/types/friend.type.js';
import { PrismaFriendShipRepository } from '../../infrastructure/persistence/prisma-friend.repository.js';

@Injectable()
export class ListFriendsService {
  constructor(
    @Inject(FRIENDSHIP_REPOSITORY)
    private readonly friendshipRepository: PrismaFriendShipRepository,
  ) {}

  execute(input: ListFriendsInput): Promise<Friendship[]> {
    return this.friendshipRepository.listFriends(input);
  }
}
