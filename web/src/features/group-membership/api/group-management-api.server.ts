import type {
  GroupJoinRequest,
  GroupMember,
  GroupMemberRole,
} from "@/entities/group";
import { authApiFetch } from "@/entities/session/server";

export async function listGroupMembersApi(
  groupId: string,
): Promise<GroupMember[]> {
  return authApiFetch<GroupMember[]>(`/groups/${groupId}/members`);
}

export async function updateGroupMemberRoleApi(input: {
  groupId: string;
  userId: string;
  role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">;
}): Promise<GroupMember> {
  return authApiFetch<GroupMember>(
    `/groups/${input.groupId}/members/${input.userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role: input.role }),
    },
  );
}

export async function removeGroupMemberApi(input: {
  groupId: string;
  userId: string;
}): Promise<void> {
  return authApiFetch<void>(
    `/groups/${input.groupId}/members/${input.userId}`,
    {
      method: "DELETE",
    },
  );
}

export async function listGroupJoinRequestsApi(
  groupId: string,
): Promise<GroupJoinRequest[]> {
  return authApiFetch<GroupJoinRequest[]>(`/groups/${groupId}/join-requests`);
}

export async function approveGroupJoinRequestApi(input: {
  groupId: string;
  requestId: string;
}): Promise<GroupJoinRequest> {
  return authApiFetch<GroupJoinRequest>(
    `/groups/${input.groupId}/join-requests/${input.requestId}/approve`,
    {
      method: "POST",
    },
  );
}

export async function rejectGroupJoinRequestApi(input: {
  groupId: string;
  requestId: string;
}): Promise<GroupJoinRequest> {
  return authApiFetch<GroupJoinRequest>(
    `/groups/${input.groupId}/join-requests/${input.requestId}/reject`,
    {
      method: "POST",
    },
  );
}
