"use client";

import { Search, Users } from "lucide-react";
import { useState } from "react";
import { GroupCard } from "@/entities/group";
import { CreateGroupForm } from "@/features/create-group";
import { GroupJoinButton, useGroupsQuery } from "@/features/group-membership";
import { useCurrentSession } from "@/entities/session";
import { Input } from "@/shared/ui";

export function GroupsOverview() {
  const { currentUser } = useCurrentSession();
  const [search, setSearch] = useState("");
  const groupsQuery = useGroupsQuery({ search });
  const groups = groupsQuery.data?.items ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <div className="rounded-card border-surface-border bg-surface-elevated shadow-card border p-4">
          <label className="sr-only" htmlFor="group-search">
            Search groups
          </label>
          <div className="relative">
            <Search className="text-muted pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              id="group-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search groups"
              className="pl-9"
            />
          </div>
        </div>

        {groupsQuery.isLoading ? (
          <GroupNotice title="Loading groups..." />
        ) : groupsQuery.error instanceof Error ? (
          <GroupNotice title="Cannot load groups" text={groupsQuery.error.message} />
        ) : groups.length === 0 ? (
          <GroupNotice
            title="No groups yet"
            text="Create the first community or try another search."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                actionSlot={
                  <GroupJoinButton group={group} canInteract={Boolean(currentUser)} />
                }
              />
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {currentUser ? (
          <CreateGroupForm />
        ) : (
          <GroupNotice
            title="Sign in to create groups"
            text="You can browse public groups now and sign in when you want to join or create one."
          />
        )}
      </aside>
    </div>
  );
}

function GroupNotice({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-card border-surface-border bg-surface-elevated shadow-card grid min-h-40 place-items-center border p-5 text-center">
      <div>
        <Users className="text-muted mx-auto size-6" />
        <h2 className="text-primary mt-3 font-semibold">{title}</h2>
        {text && <p className="text-muted mt-1 text-sm leading-6">{text}</p>}
      </div>
    </div>
  );
}
