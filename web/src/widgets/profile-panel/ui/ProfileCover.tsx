import Image from "next/image";
import { ProfileImageUploader } from "@/features/profile";
import type { UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import type { ProfilePanelVariant } from "../model/types";

type ProfileCoverProps = {
  profile: UserProfile | null;
  variant: ProfilePanelVariant;
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileCover({
  profile,
  variant,
  onProfileChange,
}: ProfileCoverProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-surface-muted",
        isSidebar ? "h-36" : "h-56 sm:h-72",
      )}
    >
      {profile?.coverUrl ? (
        <Image
          src={profile.coverUrl}
          alt=""
          fill
          sizes={isSidebar ? "360px" : "(min-width: 1024px) 1152px, 100vw"}
          className="object-cover"
          priority={!isSidebar}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-brand-gradient text-sm font-semibold text-inverse">
          Chưa có ảnh bìa
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />

      <div
        className={cn(
          "absolute",
          isSidebar ? "right-3 bottom-3" : "right-4 bottom-4",
        )}
      >
        <ProfileImageUploader kind="cover" onUploaded={onProfileChange} />
      </div>
    </div>
  );
}
