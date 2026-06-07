import Image from "next/image";
import { MoreHorizontal, Pencil, UserRound } from "lucide-react";
import { ProfileImageUploader } from "@/features/profile";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import type { ProfileMetaItem, ProfilePanelVariant } from "../model/types";

type ProfileHeaderProps = {
  profile: UserProfile | null;
  currentUser: CurrentSessionUser;
  variant: ProfilePanelVariant;
  metaItems: ProfileMetaItem[];
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileHeader({
  profile,
  currentUser,
  variant,
  metaItems,
  onProfileChange,
}: ProfileHeaderProps) {
  const isSidebar = variant === "sidebar";

  const displayName = profile?.fullName?.trim() || currentUser.email;
  const usernameLabel = profile?.username
    ? `@${profile.username}`
    : currentUser.email;

  return (
    <div
      className={cn(
        "border-b border-zinc-200",
        isSidebar
          ? "pb-4"
          : "flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 gap-4",
          isSidebar ? "-mt-10 flex-col" : "-mt-9 items-end",
        )}
      >
        <div
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-zinc-100 shadow-md shadow-zinc-300/70",
            isSidebar ? "size-24" : "size-32 sm:size-40",
          )}
        >
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`Ảnh đại diện của ${displayName}`}
              width={isSidebar ? 96 : 160}
              height={isSidebar ? 96 : 160}
              sizes={isSidebar ? "96px" : "160px"}
              className="size-full object-cover"
            />
          ) : (
            <UserRound
              className={cn("text-zinc-400", isSidebar ? "size-11" : "size-16")}
            />
          )}
        </div>

        <div className={cn("min-w-0", !isSidebar && "pb-5")}>
          <h2
            className={cn(
              "truncate font-bold tracking-tight text-zinc-950",
              isSidebar ? "text-xl" : "text-3xl",
            )}
          >
            {displayName}
          </h2>

          <p className="mt-1 truncate text-sm font-medium text-zinc-500">
            {usernameLabel}
          </p>

          {!isSidebar && (
            <p className="mt-1 text-sm text-zinc-500">
              {metaItems.length > 0
                ? `${metaItems.length} thông tin đã thêm`
                : "Chưa cập nhật thông tin cá nhân"}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          isSidebar ? "mt-4" : "pb-5",
        )}
      >
        <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />

        {!isSidebar && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              <Pencil className="size-4" />
              Chỉnh sửa
            </button>

            <button
              type="button"
              aria-label="Mở thêm tuỳ chọn"
              className="grid size-10 place-items-center rounded-xl bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
