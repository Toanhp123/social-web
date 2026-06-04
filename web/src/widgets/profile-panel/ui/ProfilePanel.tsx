"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  Globe,
  ImageUp,
  MapPin,
  UserRound,
} from "lucide-react";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";
import { ProfileEditor, uploadMyProfileImageAction } from "@/features/profile";
import { ImageUploader } from "@/shared/ui";

type ProfilePanelProps = {
  currentUser: CurrentSessionUser;
  initialProfile: UserProfile | null;
};

export function ProfilePanel({
  currentUser,
  initialProfile,
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const displayName = profile?.fullName ?? currentUser.email;
  const metaItems = useMemo(
    () =>
      [
        profile?.locationName
          ? { icon: MapPin, label: profile.locationName }
          : null,
        profile?.website ? { icon: Globe, label: profile.website } : null,
        profile?.birthday
          ? { icon: CalendarDays, label: formatDate(profile.birthday) }
          : null,
      ].filter(Boolean),
    [profile],
  );

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="relative h-56 bg-zinc-800">
          {profile?.coverUrl ? (
            <Image
              src={profile.coverUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#27272a_45%,#1e3a8a)] text-sm text-zinc-400">
              Chua co anh bia
            </div>
          )}

          <div className="absolute right-4 bottom-4">
            <ImageUploader
              label="Doi anh bia"
              icon={<ImageUp className="size-4" />}
              extraFields={{ kind: "cover" }}
              upload={uploadMyProfileImage}
              onUploaded={setProfile}
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-zinc-900 bg-zinc-800">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt=""
                    width={112}
                    height={112}
                    sizes="112px"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-12 text-zinc-500" />
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-2xl font-semibold text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-zinc-400">
                  {profile?.username
                    ? `@${profile.username}`
                    : currentUser.email}
                </p>
              </div>
            </div>

            <ImageUploader
              label="Doi avatar"
              icon={<Camera className="size-4" />}
              extraFields={{ kind: "avatar" }}
              upload={uploadMyProfileImage}
              onUploaded={setProfile}
            />
          </div>

          {profile?.bio && (
            <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-300">
              {profile.bio}
            </p>
          )}

          {metaItems.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-400">
              {metaItems.map((item) => {
                if (!item) {
                  return null;
                }

                const Icon = item.icon;

                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2"
                  >
                    <Icon className="size-4 text-blue-300" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">
            Thong tin profile
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Cap nhat thong tin hien thi tren trang ca nhan cua ban.
          </p>
        </div>

        <ProfileEditor profile={profile} onProfileChange={setProfile} />
      </div>
    </section>
  );
}

async function uploadMyProfileImage(formData: FormData) {
  const result = await uploadMyProfileImageAction(formData);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.profile;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
