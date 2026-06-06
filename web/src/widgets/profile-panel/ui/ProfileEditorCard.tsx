import type { UserProfile } from "@/entities/user";
import { ProfileEditor } from "@/features/profile";

type ProfileEditorCardProps = {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileEditorCard({
  profile,
  onProfileChange,
}: ProfileEditorCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm shadow-zinc-200/70 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-zinc-950">Thông tin profile</h3>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Cập nhật thông tin hiển thị trên trang cá nhân của bạn.
        </p>
      </div>

      <ProfileEditor profile={profile} onProfileChange={onProfileChange} />
    </div>
  );
}
