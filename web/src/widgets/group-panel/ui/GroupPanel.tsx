"use client";

import { Lock, Users } from "lucide-react";
import type { Group } from "@/entities/group";
import { useCurrentSession } from "@/entities/session";
import { CreatePostComposer } from "@/features/create-post";
import { GroupJoinButton, useGroupQuery } from "@/features/group-membership";
import { PostFeed } from "@/widgets/post-feed";

type GroupPanelProps = {
  group: Group;
};

export function GroupPanel({ group: initialGroup }: GroupPanelProps) {
  const { currentUser } = useCurrentSession();
  const groupQuery = useGroupQuery(initialGroup.id, initialGroup);
  const group = groupQuery.data ?? initialGroup;
  const isMember = Boolean(group.viewer.role);
  const canInteract = Boolean(currentUser);
  const canViewFeed = group.privacy === "PUBLIC" || isMember;

  return (
    <div className="space-y-5">
      <section className="rounded-card border-surface-border bg-surface-elevated shadow-card overflow-hidden border">
        <div className="bg-surface-muted h-40 sm:h-52" />

        <div className="px-4 pb-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="rounded-control bg-brand text-inverse shadow-card -mt-10 grid size-20 place-items-center text-2xl font-semibold">
                {group.name.trim().charAt(0).toUpperCase() || "G"}
              </div>

              <h1 className="text-primary mt-3 text-2xl font-bold">
                {group.name}
              </h1>

              <div className="text-muted mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  {group.privacy === "PRIVATE" ? (
                    <Lock className="size-4" />
                  ) : (
                    <Users className="size-4" />
                  )}
                  {group.privacy === "PRIVATE" ? "Private group" : "Public group"}
                </span>
                <span>{group.memberCount} members</span>
              </div>
            </div>

            <GroupJoinButton group={group} canInteract={canInteract} />
          </div>

          {group.description && (
            <p className="text-secondary mt-4 max-w-3xl text-sm leading-6">
              {group.description}
            </p>
          )}
        </div>
      </section>

      {isMember && <CreatePostComposer groupId={group.id} />}

      {canViewFeed ? (
        <PostFeed
          canInteract={canInteract}
          groupId={group.id}
          emptyTitle="No group posts yet"
          emptyDescription="Members can start the first discussion here."
        />
      ) : (
        <section className="rounded-card border-surface-border bg-surface-elevated shadow-card border p-6 text-center">
          <Lock className="text-muted mx-auto size-7" />
          <h2 className="text-primary mt-3 font-semibold">
            Join this private group to see posts
          </h2>
          <p className="text-muted mt-1 text-sm leading-6">
            Your request will be reviewed by group admins.
          </p>
        </section>
      )}
    </div>
  );
}
