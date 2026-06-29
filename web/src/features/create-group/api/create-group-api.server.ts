import type { Group } from "@/entities/group";
import { authApiFetch } from "@/entities/session/server";

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
