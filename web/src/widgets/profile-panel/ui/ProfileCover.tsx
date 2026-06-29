import Image from "next/image";
import { ProfileImageUploader } from "@/features/profile";
import type { UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
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
  const t = useTranslations().profile;
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "bg-surface-muted relative w-full overflow-hidden",
        isSidebar
          ? "h-36"
          : "aspect-16/7 max-h-90 min-h-40 sm:min-h-64 lg:min-h-72",
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
        <div className="bg-surface-soft text-muted flex size-full items-center justify-center text-sm font-semibold">
          {t.noCoverPhoto}
        </div>
      )}

      <div className="absolute inset-0 bg-(image:--cover-overlay)" />

      {canEdit && (
        <div
          className={cn(
            "absolute",
            isSidebar
              ? "right-3 bottom-3"
              : "right-3 bottom-3 sm:right-4 sm:bottom-4",
          )}
        >
          <ProfileImageUploader kind="cover" onUploaded={onProfileChange} />
        </div>
      )}
    </div>
  );
}
