import { authApiFetch, optionalAuthApiFetch } from "@/entities/session/server";
import type {
  Group,
  GroupJoinRequest,
  GroupMember,
  GroupMemberRole,
  GroupPage,
} from "../model/types";

export type ListGroupsApiInput = {
  cursor?: string | null;
  limit?: number;
  search?: string | null;
};

export async function listGroupsApi({
  cursor,
  limit = 20,
  search,
}: ListGroupsApiInput = {}): Promise<GroupPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (search?.trim()) {
    searchParams.set("search", search.trim());
  }

  return optionalAuthApiFetch<GroupPage>(`/groups?${searchParams.toString()}`);
}

export async function getGroupApi(groupId: string): Promise<Group> {
  return optionalAuthApiFetch<Group>(`/groups/${groupId}`);
}

export async function createGroupApi(input: {
  name: string;
  description?: string | null;
  privacy: "PUBLIC" | "PRIVATE";
}): Promise<Group> {
  return authApiFetch<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

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
