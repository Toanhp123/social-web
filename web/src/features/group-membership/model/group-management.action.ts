"use server";

import { ApiError } from "@/shared/api/api-error";
import type {
  GroupJoinRequest,
  GroupMember,
  GroupMemberRole,
} from "@/entities/group";
import {
  approveGroupJoinRequestApi,
  listGroupJoinRequestsApi,
  listGroupMembersApi,
  rejectGroupJoinRequestApi,
  removeGroupMemberApi,
  updateGroupMemberRoleApi,
} from "@/entities/group/server";

export type ListGroupMembersActionResult =
  | { ok: true; members: GroupMember[] }
  | { ok: false; error: string };

export type ListGroupJoinRequestsActionResult =
  | { ok: true; requests: GroupJoinRequest[] }
  | { ok: false; error: string };

export type GroupJoinRequestActionResult =
  | { ok: true; request: GroupJoinRequest }
  | { ok: false; error: string };

export type UpdateGroupMemberRoleActionResult =
  | { ok: true; member: GroupMember }
  | { ok: false; error: string };

export type RemoveGroupMemberActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function listGroupMembersAction(input: {
  groupId: string;
}): Promise<ListGroupMembersActionResult> {
  try {
    return {
      ok: true,
      members: await listGroupMembersApi(input.groupId),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function listGroupJoinRequestsAction(input: {
  groupId: string;
}): Promise<ListGroupJoinRequestsActionResult> {
  try {
    return {
      ok: true,
      requests: await listGroupJoinRequestsApi(input.groupId),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function approveGroupJoinRequestAction(input: {
  groupId: string;
  requestId: string;
}): Promise<GroupJoinRequestActionResult> {
  try {
    return {
      ok: true,
      request: await approveGroupJoinRequestApi(input),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rejectGroupJoinRequestAction(input: {
  groupId: string;
  requestId: string;
}): Promise<GroupJoinRequestActionResult> {
  try {
    return {
      ok: true,
      request: await rejectGroupJoinRequestApi(input),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateGroupMemberRoleAction(input: {
  groupId: string;
  userId: string;
  role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">;
}): Promise<UpdateGroupMemberRoleActionResult> {
  try {
    return {
      ok: true,
      member: await updateGroupMemberRoleApi(input),
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeGroupMemberAction(input: {
  groupId: string;
  userId: string;
}): Promise<RemoveGroupMemberActionResult> {
  try {
    await removeGroupMemberApi(input);

    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

function toActionError(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Da co loi xay ra." };
}
