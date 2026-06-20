"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GroupMemberRole } from "@/entities/group";
import { groupQueryKeys } from "./group-membership-query-keys";
import {
  approveGroupJoinRequestAction,
  rejectGroupJoinRequestAction,
  removeGroupMemberAction,
  updateGroupMemberRoleAction,
} from "./group-management.action";

export function useApproveGroupJoinRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { groupId: string; requestId: string }) => {
      const result = await approveGroupJoinRequestAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.request;
    },
    onSuccess: (_, variables) => {
      invalidateGroupManagement(queryClient, variables.groupId);
    },
  });
}

export function useRejectGroupJoinRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { groupId: string; requestId: string }) => {
      const result = await rejectGroupJoinRequestAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.joinRequests(variables.groupId),
      });
    },
  });
}

export function useUpdateGroupMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      groupId: string;
      userId: string;
      role: Extract<GroupMemberRole, "ADMIN" | "MEMBER">;
    }) => {
      const result = await updateGroupMemberRoleAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.member;
    },
    onSuccess: (_, variables) => {
      invalidateGroupManagement(queryClient, variables.groupId);
    },
  });
}

export function useRemoveGroupMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { groupId: string; userId: string }) => {
      const result = await removeGroupMemberAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }
    },
    onSuccess: (_, variables) => {
      invalidateGroupManagement(queryClient, variables.groupId);
    },
  });
}

function invalidateGroupManagement(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: string,
) {
  queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) });
  queryClient.invalidateQueries({ queryKey: groupQueryKeys.members(groupId) });
  queryClient.invalidateQueries({
    queryKey: groupQueryKeys.joinRequests(groupId),
  });
  queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });
}
