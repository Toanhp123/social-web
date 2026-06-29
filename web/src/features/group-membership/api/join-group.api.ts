import { authApiFetch } from "@/entities/session/server";
import type { JoinGroupResult } from "@/entities/group";

export async function joinGroupApi(groupId: string): Promise<JoinGroupResult> {
  return authApiFetch<JoinGroupResult>(`/groups/${groupId}/join`, {
    method: "POST",
  });
}
