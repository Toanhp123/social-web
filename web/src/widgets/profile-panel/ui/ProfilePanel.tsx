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
import { ProfileEditor } from "@/features/profile";
import { uploadMyProfileImageAction } from "@/features/profile/actions";
import { ImageUploader } from "@/shared/ui";

type ProfilePanelProps = {
  currentUser: CurrentSessionUser;
  initialProfile: UserProfile | null;
  variant?: "default" | "sidebar";
};

export function ProfilePanel({
  currentUser,
  initialProfile,
  variant = "default",
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const isSidebar = variant === "sidebar";
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
    <section className={isSidebar ? "space-y-4" : "space-y-6"}>
      <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm shadow-zinc-200/70">
        <div
          className={
            isSidebar
              ? "relative h-32 bg-zinc-100"
              : "relative h-56 bg-zinc-100"
          }
        >
          {profile?.coverUrl ? (
            <Image
              src={profile.coverUrl}
              alt=""
              fill
              sizes={isSidebar ? "360px" : "(min-width: 1024px) 1152px, 100vw"}
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#2563eb,#14b8a6_55%,#f59e0b)] text-sm font-medium text-white">
              Chua co anh bia
            </div>
          )}

          <div
            className={
              isSidebar
                ? "absolute right-3 bottom-3"
                : "absolute right-4 bottom-4"
            }
          >
            <ImageUploader
              label="Doi anh bia"
              icon={<ImageUp className="size-4" />}
              extraFields={{ kind: "cover" }}
              upload={uploadMyProfileImage}
              onUploaded={setProfile}
            />
          </div>
        </div>

        <div className={isSidebar ? "px-4 pb-4" : "px-6 pb-6"}>
          <div
            className={[
              isSidebar
                ? "-mt-9 flex flex-col gap-4"
                : "-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
            ].join(" ")}
          >
            <div className="flex items-end gap-4">
              <div
                className={[
                  "grid shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-zinc-100 shadow-sm",
                  isSidebar ? "size-20" : "size-28",
                ].join(" ")}
              >
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt=""
                    width={isSidebar ? 80 : 112}
                    height={isSidebar ? 80 : 112}
                    sizes={isSidebar ? "80px" : "112px"}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound
                    className={[
                      "text-zinc-400",
                      isSidebar ? "size-9" : "size-12",
                    ].join(" ")}
                  />
                )}
              </div>

              <div className="pb-1">
                <h2
                  className={[
                    "font-semibold text-zinc-950",
                    isSidebar ? "text-lg" : "text-2xl",
                  ].join(" ")}
                >
                  {displayName}
                </h2>
                <p className="text-sm text-zinc-500">
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
            <p
              className={[
                "text-sm leading-6 text-zinc-600",
                isSidebar ? "mt-4" : "mt-5 max-w-3xl",
              ].join(" ")}
            >
              {profile.bio}
            </p>
          )}

          {metaItems.length > 0 && (
            <div
              className={[
                "flex flex-wrap gap-3 text-sm text-zinc-600",
                isSidebar ? "mt-4" : "mt-5",
              ].join(" ")}
            >
              {metaItems.map((item) => {
                if (!item) {
                  return null;
                }

                const Icon = item.icon;

                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2"
                  >
                    <Icon className="size-4 text-blue-600" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={
          isSidebar
            ? "rounded-2xl border border-white bg-white p-4 shadow-sm shadow-zinc-200/70"
            : "rounded-2xl border border-white bg-white p-6 shadow-sm shadow-zinc-200/70"
        }
      >
        <div className="mb-6">
          <h3
            className={
              isSidebar
                ? "font-semibold text-zinc-950"
                : "text-lg font-semibold text-zinc-950"
            }
          >
            Thong tin profile
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
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
