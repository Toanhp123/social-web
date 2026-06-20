import {
  GroupJoinRequestStatus,
  GroupMemberRole,
} from '@/generated/prisma/client.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import {
  CreateGroupInput,
  GroupMembership,
  ListGroupsInput,
  ListGroupsPage,
} from '@/modules/groups/domain/types/group.type.js';

export abstract class GroupRepository {
  abstract create(input: CreateGroupInput): Promise<Group>;
  abstract findById(input: {
    groupId: string;
    viewerId?: string;
  }): Promise<Group | null>;
  abstract listPage(input: ListGroupsInput): Promise<ListGroupsPage>;
  abstract findMembership(input: {
    groupId: string;
    userId: string;
  }): Promise<GroupMembership | null>;
  abstract findPendingJoinRequest(input: {
    groupId: string;
    requesterId: string;
  }): Promise<GroupJoinRequest | null>;
  abstract addMember(input: {
    groupId: string;
    userId: string;
    role: GroupMemberRole;
  }): Promise<GroupMembership>;
  abstract createJoinRequest(input: {
    groupId: string;
    requesterId: string;
  }): Promise<GroupJoinRequest>;
  abstract listJoinRequests(input: {
    groupId: string;
    userId: string;
  }): Promise<GroupJoinRequest[]>;
  abstract updateJoinRequest(input: {
    requestId: string;
    groupId: string;
    actorId: string;
    status: Extract<GroupJoinRequestStatus, 'APPROVED' | 'REJECTED'>;
  }): Promise<GroupJoinRequest>;
}
