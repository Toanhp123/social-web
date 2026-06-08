"use client";

import { Camera, ImageUp } from "lucide-react";
import type { UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { ImageUploader } from "@/shared/ui";
import { uploadMyProfileImageAction } from "../model/profile.action";

type ProfileImageUploaderProps = {
  kind: "avatar" | "cover";
  onUploaded: (profile: UserProfile | null) => void;
};

export function ProfileImageUploader({
  kind,
  onUploaded,
}: ProfileImageUploaderProps) {
  const t = useTranslations().profile;
  const isAvatar = kind === "avatar";

  return (
    <ImageUploader
      label={isAvatar ? t.changeAvatar : t.changeCover}
      icon={
        isAvatar ? (
          <Camera className="size-4" />
        ) : (
          <ImageUp className="size-4" />
        )
      }
      extraFields={{ kind }}
      upload={uploadProfileImage}
      onUploaded={onUploaded}
    />
  );
}

async function uploadProfileImage(formData: FormData) {
  const result = await uploadMyProfileImageAction(formData);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.profile;
}

