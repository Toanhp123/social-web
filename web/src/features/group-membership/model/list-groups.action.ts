"use server";

import { ApiError } from "@/shared/api/api-error";
import type { GroupPage } from "@/entities/group";
import { listGroupsApi } from "@/entities/group/server";

export type ListGroupsActionResult =
  | { ok: true; page: GroupPage }
  | { ok: false; error: string };

export async function listGroupsAction(
  input: {
    cursor?: string | null;
    limit?: number;
    search?: string | null;
  } = {},
): Promise<ListGroupsActionResult> {
  try {
    return {
      ok: true,
      page: await listGroupsApi(input),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
