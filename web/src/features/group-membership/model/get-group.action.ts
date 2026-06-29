"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Group } from "@/entities/group";
import { getGroupApi } from "@/entities/group/server";

export type GetGroupActionResult =
  | { ok: true; group: Group }
  | { ok: false; error: string };

export async function getGroupAction(input: {
  groupId: string;
}): Promise<GetGroupActionResult> {
  if (!input.groupId.trim()) {
    return { ok: false, error: "Du lieu khong hop le." };
  }

  try {
    return {
      ok: true,
      group: await getGroupApi(input.groupId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
