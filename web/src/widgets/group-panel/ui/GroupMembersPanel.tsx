"use client";

import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Group, GroupMember } from "@/entities/group";
import { useGroupMembersQuery } from "@/features/group-membership";
import { getProfileRoute } from "@/shared/config/routes";
import { Avatar, Card, EmptyState, SearchField } from "@/shared/ui";
import type { GroupMessages } from "./group-panel.types";

type GroupMembersPanelProps = {
  group: Group;
  canView: boolean;
  t: GroupMessages;
};

export function GroupMembersPanel({
  group,
  canView,
  t,
}: GroupMembersPanelProps) {
  const [search, setSearch] = useState("");
  const membersQuery = useGroupMembersQuery(group.id, canView);
  const filteredMembers = useMemo(
    () => filterMembers(membersQuery.data ?? [], search),
    [membersQuery.data, search],
  );
  const admins = filteredMembers.filter((member) => member.role !== "MEMBER");
  const regularMembers = filteredMembers.filter(
    (member) => member.role === "MEMBER",
  );

  if (!canView) {
    return (
      <EmptyState
        icon={<Users className="size-8" />}
        title={t.detail.privateMembersTitle}
        description={t.detail.privateMembersDescription}
      />
    );
  }

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <header className="border-soft border-b p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-primary text-lg font-semibold">
              {t.detail.membersTitle}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {t.membersCount.replace("{count}", String(group.memberCount))}
            </p>
          </div>

          <SearchField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.detail.membersSearchPlaceholder}
            wrapperClassName="w-full sm:max-w-xs"
          />
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-5">
        {membersQuery.isLoading ? (
          <p className="text-muted text-sm">{t.detail.loadingMembers}</p>
        ) : membersQuery.isError ? (
          <p className="text-danger text-sm">{membersQuery.error.message}</p>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={<Users className="size-8" />}
            title={t.detail.membersEmptyTitle}
            description={t.detail.membersEmptyDescription}
            className="grid min-h-32 place-items-center text-center"
          />
        ) : (
          <>
            {admins.length > 0 && (
              <MemberSection
                title={t.detail.adminsSection}
                members={admins}
                t={t}
                featured
              />
            )}

            <MemberSection
              title={t.detail.membersSection}
              members={regularMembers}
              t={t}
            />
          </>
        )}
      </div>
    </Card>
  );
}

function MemberSection({
  title,
  members,
  t,
  featured = false,
}: {
  title: string;
  members: GroupMember[];
  t: GroupMessages;
  featured?: boolean;
}) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-primary flex items-center gap-2 text-sm font-semibold">
        {featured && <ShieldCheck className="text-brand size-4" />}
        {title}
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {members.map((member) => (
          <Link
            key={member.userId}
            href={getProfileRoute(member.userId)}
            className="rounded-card border-surface-border hover:bg-surface-muted flex min-w-0 items-center gap-3 border p-3 transition"
          >
            <Avatar
              src={member.user.avatarUrl}
              name={member.user.fullName}
              alt={member.user.fullName}
              size={44}
            />

            <span className="min-w-0 flex-1">
              <span className="text-primary block truncate text-sm font-semibold">
                {member.user.fullName}
              </span>
              <span className="text-muted block truncate text-xs">
                {member.user.username
                  ? `@${member.user.username}`
                  : getRoleLabel(member.role, t)}
              </span>
            </span>

            <span className="rounded-pill bg-surface-soft text-secondary shrink-0 px-2 py-1 text-[11px] font-medium">
              {getRoleLabel(member.role, t)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function filterMembers(members: GroupMember[], search: string): GroupMember[] {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return members;
  }

  return members.filter((member) => {
    const fullName = member.user.fullName.toLowerCase();
    const username = member.user.username?.toLowerCase() ?? "";

    return fullName.includes(normalizedSearch) || username.includes(normalizedSearch);
  });
}

function getRoleLabel(role: GroupMember["role"], t: GroupMessages) {
  if (role === "OWNER") return t.detail.roleOwner;
  if (role === "ADMIN") return t.detail.roleAdmin;

  return t.detail.roleMember;
}
