import { Lock, ShieldCheck, Users } from "lucide-react";
import type { Group } from "@/entities/group";
import { GroupJoinButton } from "@/features/group-membership";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui";
import type { GroupMessages } from "./group-panel.types";

type GroupHeaderProps = {
  group: Group;
  canInteract: boolean;
  isMember: boolean;
  canManage: boolean;
  t: GroupMessages;
};

export function GroupHeader({
  group,
  canInteract,
  isMember,
  canManage,
  t,
}: GroupHeaderProps) {
  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card overflow-hidden border">
      <div
        className={cn(
          "bg-surface-muted h-44 bg-cover bg-center sm:h-56",
          !group.coverUrl &&
            "bg-gradient-to-br from-brand-soft via-surface-muted to-surface",
        )}
        style={
          group.coverUrl
            ? { backgroundImage: `url("${group.coverUrl}")` }
            : undefined
        }
      />

      <div className="px-4 pb-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Avatar
              src={group.avatarUrl}
              alt={group.name}
              name={group.name}
              size={92}
              className="rounded-control ring-surface -mt-12 shadow-card ring-4"
            />

            <h1 className="text-primary mt-3 text-2xl font-bold sm:text-3xl">
              {group.name}
            </h1>

            <div className="text-muted mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5">
                {group.privacy === "PRIVATE" ? (
                  <Lock className="size-4" />
                ) : (
                  <Users className="size-4" />
                )}
                {getPrivacyLabel(group, t)}
              </span>
              <span aria-hidden="true">{"."}</span>
              <span>
                {t.membersCount.replace("{count}", String(group.memberCount))}
              </span>
              {isMember && (
                <>
                  <span aria-hidden="true">{"."}</span>
                  <span>{getRoleLabel(group.viewer.role, t)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <span className="rounded-pill bg-brand-soft text-brand inline-flex h-10 items-center gap-2 px-3 text-sm font-semibold">
                <ShieldCheck className="size-4" />
                {t.detail.manage}
              </span>
            )}

            <GroupJoinButton group={group} canInteract={canInteract} />
          </div>
        </div>
      </div>
    </section>
  );
}

function getPrivacyLabel(group: Group, t: GroupMessages) {
  return group.privacy === "PRIVATE" ? t.privateGroup : t.publicGroup;
}

function getRoleLabel(role: Group["viewer"]["role"], t: GroupMessages) {
  if (role === "OWNER") return t.detail.roleOwner;
  if (role === "ADMIN") return t.detail.roleAdmin;
  return t.detail.roleMember;
}
