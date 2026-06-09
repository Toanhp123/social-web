import { FriendRequest } from '../entities/friend-request.entity.js';
import {
  AcceptFriendRequestResult,
  FriendRequestActionInput,
  ListFriendRequestsInput,
  SendFriendRequestInput,
} from '../types/friend.type.js';

export abstract class FriendRequestRepository {
  abstract sendRequest(input: SendFriendRequestInput): Promise<FriendRequest>;

  abstract acceptRequest(
    input: FriendRequestActionInput,
  ): Promise<AcceptFriendRequestResult>;

  abstract rejectRequest(
    input: FriendRequestActionInput,
  ): Promise<FriendRequest>;

  abstract cancelRequest(input: FriendRequestActionInput): Promise<void>;

  abstract listRequests(
    input: ListFriendRequestsInput,
  ): Promise<FriendRequest[]>;
}
