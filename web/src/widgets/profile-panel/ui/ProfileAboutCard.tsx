import type { UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import type { ProfileMetaItem } from "../model/types";

type ProfileAboutCardProps = {
  profile: UserProfile | null;
  metaItems: ProfileMetaItem[];
};

export function ProfileAboutCard({
  profile,
  metaItems,
}: ProfileAboutCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm shadow-zinc-200/70">
      <h3 className="text-lg font-bold text-zinc-950">Giới thiệu</h3>

      <p
        className={cn(
          "mt-3 text-sm leading-6",
          profile?.bio ? "text-zinc-700" : "text-zinc-400",
        )}
      >
        {profile?.bio ?? "Chưa có giới thiệu cá nhân."}
      </p>

      {metaItems.length > 0 && (
        <div className="mt-4 space-y-3">
          {metaItems.map((item) => {
            const Icon = item.icon;

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-3 text-sm text-zinc-700 transition hover:text-blue-600"
                >
                  <Icon className="size-5 shrink-0 text-zinc-500" />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            }

            return (
              <div
                key={item.label}
                className="flex min-w-0 items-center gap-3 text-sm text-zinc-700"
              >
                <Icon className="size-5 shrink-0 text-zinc-500" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {metaItems.length === 0 && (
        <p className="mt-3 text-sm text-zinc-400">
          Chưa thêm vị trí, website hoặc ngày sinh.
        </p>
      )}
    </div>
  );
}
