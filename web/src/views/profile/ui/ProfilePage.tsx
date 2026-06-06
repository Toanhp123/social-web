import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/logout";
import { getCurrentSessionUser } from "@/entities/session/lib/current-session-user.server";
import { AppLayout } from "@/widgets/app-layout";
import { ProfilePanel } from "@/widgets/profile-panel";
import { ROUTES } from "@/shared/config/routes";
import { getCurrentProfileOrNull } from "../server/server";

export async function ProfilePage() {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect(ROUTES.login);
  }

  const profile = await getCurrentProfileOrNull(currentUser.id);

  return (
    <AppLayout
      title="Trang cá nhân"
      description="Xem và cập nhật thông tin hiển thị trên trang cá nhân của bạn."
      actions={<LogoutButton />}
    >
      <ProfilePanel currentUser={currentUser} initialProfile={profile} />
    </AppLayout>
  );
}
