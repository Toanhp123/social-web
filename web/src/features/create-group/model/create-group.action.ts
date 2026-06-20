"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Group } from "@/entities/group";
import { createGroupApi } from "@/entities/group/server";
import { createGroupSchema } from "./create-group.schema";

export type CreateGroupActionResult =
  | { ok: true; group: Group }
  | { ok: false; error: string };

export async function createGroupAction(
  formData: FormData,
): Promise<CreateGroupActionResult> {
  const parsedInput = createGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    privacy: formData.get("privacy"),
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      group: await createGroupApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
