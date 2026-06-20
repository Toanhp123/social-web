"use server";

import { ApiError } from "@/shared/api/api-error";
import type { JoinGroupResult } from "@/entities/group";
import { joinGroupApi } from "../api/join-group.api";

export type JoinGroupActionResult =
  | { ok: true; result: JoinGroupResult }
  | { ok: false; error: string };

export async function joinGroupAction(input: {
  groupId: string;
}): Promise<JoinGroupActionResult> {
  if (!input.groupId.trim()) {
    return { ok: false, error: "Du lieu khong hop le." };
  }

  try {
    return {
      ok: true,
      result: await joinGroupApi(input.groupId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
