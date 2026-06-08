"use client";

import type { FormEvent } from "react";
import { Save, Trash2 } from "lucide-react";
import type { UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { Button, Input, Textarea } from "@/shared/ui";
import {
  useDeleteProfileMutation,
  useSaveProfileMutation,
} from "../model/use-profile-mutations";

type ProfileEditorProps = {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileEditor({
  profile,
  onProfileChange,
}: ProfileEditorProps) {
  const t = useTranslations().profile;
  const hasPersistedProfile = Boolean(profile?.createdAt);
  const saveMutation = useSaveProfileMutation({ onProfileChange });
  const deleteMutation = useDeleteProfileMutation({ onProfileChange });
  const saveError =
    saveMutation.error instanceof Error ? saveMutation.error.message : "";
  const deleteError =
    deleteMutation.error instanceof Error ? deleteMutation.error.message : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="hidden"
        name="mode"
        value={hasPersistedProfile ? "update" : "create"}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-secondary">
          Bio
          <Textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            maxLength={500}
            rows={5}
            className="mt-2 min-h-32 resize-y rounded-control px-4 py-3 leading-6 text-primary focus:border-brand"
          />
        </label>

        <div className="space-y-5">
          <label className="block text-sm font-medium text-secondary">
            {t.website}
            <Input
              name="website"
              type="url"
              defaultValue={profile?.website ?? ""}
              placeholder="https://example.com"
              maxLength={255}
            />
          </label>

          <label className="block text-sm font-medium text-secondary">
            {t.location}
            <Input
              name="locationName"
              defaultValue={profile?.locationName ?? ""}
              maxLength={255}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block text-sm font-medium text-secondary">
          {t.gender}
          <Input
            name="gender"
            defaultValue={profile?.gender ?? ""}
            maxLength={50}
          />
        </label>

        <label className="block text-sm font-medium text-secondary">
          {t.relationship}
          <Input
            name="relationshipStatus"
            defaultValue={profile?.relationshipStatus ?? ""}
            maxLength={100}
          />
        </label>

        <label className="block text-sm font-medium text-secondary">
          {t.birthday}
          <Input
            name="birthday"
            type="date"
            defaultValue={toDateInputValue(profile?.birthday)}
          />
        </label>
      </div>

      <div className="grid gap-3 text-sm text-secondary sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-control border border-subtle bg-surface-soft px-4 py-3">
          <input
            name="isBirthdayPublic"
            type="checkbox"
            defaultChecked={profile?.isBirthdayPublic ?? false}
            className="size-4 accent-blue-500"
          />
          {t.publicBirthday}
        </label>

        <label className="flex items-center gap-3 rounded-control border border-subtle bg-surface-soft px-4 py-3">
          <input
            name="isFriendListPublic"
            type="checkbox"
            defaultChecked={profile?.isFriendListPublic ?? true}
            className="size-4 accent-blue-500"
          />
          {t.publicFriends}
        </label>
      </div>

      {(saveError || deleteError) && (
        <p className="rounded-control bg-danger-soft px-4 py-3 text-sm text-danger">
          {saveError || deleteError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Save className="size-4" />
          {saveMutation.isPending
            ? t.saving
            : hasPersistedProfile
              ? t.saveProfile
              : t.createProfile}
        </Button>

        {hasPersistedProfile && (
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-control border border-danger-soft px-4 py-3 font-medium text-danger hover:bg-danger-soft disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            {deleteMutation.isPending ? t.deleting : t.deleteProfile}
          </button>
        )}
      </div>
    </form>
  );
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

