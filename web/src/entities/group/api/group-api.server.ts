import {
  authApiFetch,
  optionalAuthApiFetch,
} from "@/entities/session/server";
import type { Group, GroupPage } from "../model/types";

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
