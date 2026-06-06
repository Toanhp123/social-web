import Image from "next/image";
import { ProfileImageUploader } from "@/features/profile";
import type { UserProfile } from "@/entities/user";
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
      className={[
        "relative w-full overflow-hidden bg-zinc-100",
        isSidebar ? "h-36" : "h-56 sm:h-72",
      ]
        .filter(Boolean)
        .join(" ")}
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
        <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#2563eb,#14b8a6_55%,#f59e0b)] text-sm font-semibold text-white">
          Chưa có ảnh bìa
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />

      <div
        className={[
          "absolute",
          isSidebar ? "right-3 bottom-3" : "right-4 bottom-4",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ProfileImageUploader kind="cover" onUploaded={onProfileChange} />
      </div>
    </div>
  );
}
