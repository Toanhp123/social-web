import Image from "next/image";
import { ProfileImageUploader } from "@/features/profile";
import type { UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import type { ProfilePanelVariant } from "../model/types";

type ProfileCoverProps = {
  profile: UserProfile | null;
  variant: ProfilePanelVariant;
  onProfileChange: (profile: UserProfile | null) => void;
  canEdit?: boolean;
};

export function ProfileCover({
  profile,
  variant,
  onProfileChange,
  canEdit = true,
}: ProfileCoverProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "bg-surface-muted relative w-full overflow-hidden",
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
        <div className="bg-brand-gradient text-inverse flex size-full items-center justify-center text-sm font-semibold">
          Chưa có ảnh bìa
        </div>
      )}

      <div className="absolute inset-0 bg-[image:var(--cover-overlay)]" />

      {canEdit && (
        <div
          className={cn(
            "absolute",
            isSidebar ? "right-3 bottom-3" : "right-4 bottom-4",
          )}
        >
          <ProfileImageUploader kind="cover" onUploaded={onProfileChange} />
        </div>
      )}
    </div>
  );
}
