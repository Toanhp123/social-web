import { Avatar } from "@/shared/ui/Avatar";

type FriendUserCardProps = {
  avatarUrl?: string | null;
  fullName: string;
  username?: string | null;
  avatarAlt: string;
  action?: React.ReactNode;
};

export function FriendUserCard({
  avatarUrl,
  fullName,
  username,
  avatarAlt,
  action,
}: FriendUserCardProps) {
  return (
    <article className="border-subtle bg-surface hover:bg-surface-soft rounded-card flex items-center justify-between gap-4 border p-4 transition">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={avatarUrl}
          alt={`${avatarAlt} ${fullName}`}
          name={fullName}
        />

        <div className="min-w-0">
          <p className="text-primary truncate font-medium">{fullName}</p>

          {username && (
            <p className="text-muted truncate text-sm">@{username}</p>
          )}
        </div>
      </div>

      {action}
    </article>
  );
}
