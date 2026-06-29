import type {
  Group,
  GroupJoinRequest,
  GroupMediaPage,
  GroupMember,
  GroupMemberRole,
} from "@/entities/group";
import { authApiFetch, optionalAuthApiFetch } from "@/entities/session/server";

export async function listGroupMembersApi(
  groupId: string,
): Promise<GroupMember[]> {
  return optionalAuthApiFetch<GroupMember[]>(`/groups/${groupId}/members`);
}

export async function listGroupMediaApi(input: {
  groupId: string;
  cursor?: string | null;
  limit?: number;
}): Promise<GroupMediaPage> {
  const searchParams = new URLSearchParams({
    limit: String(input.limit ?? 24),
  });

  if (input.cursor) {
    searchParams.set("cursor", input.cursor);
  }

  return optionalAuthApiFetch<GroupMediaPage>(
    `/groups/${input.groupId}/media?${searchParams.toString()}`,
  );
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

export async function updateGroupPrivacyApi(input: {
  groupId: string;
  privacy: Group["privacy"];
}): Promise<Group> {
  return authApiFetch<Group>(`/groups/${input.groupId}/privacy`, {
    method: "PATCH",
    body: JSON.stringify({ privacy: input.privacy }),
  });
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
