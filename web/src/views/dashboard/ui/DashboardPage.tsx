import { LogoutButton } from "@/features/logout";
import { getCurrentSessionUser } from "@/entities/session/server";
import { getUserProfileApi } from "@/features/profile/api/profile-api.server";
import { AppLayout } from "@/widgets/app-layout";
import { ProfilePanel } from "@/widgets/profile-panel";
import { ApiError } from "@/shared/api/api-error";

export async function DashboardPage() {
  const currentUser = await getCurrentSessionUser();
  const profile = currentUser
    ? await getCurrentProfileOrNull(currentUser.id)
    : null;

  return (
    <AppLayout
      title="Dashboard"
      description="Quan ly profile va thong tin hien thi."
      actions={<LogoutButton />}
    >
      {currentUser ? (
        <ProfilePanel currentUser={currentUser} initialProfile={profile} />
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-300">
          Khong doc duoc phien dang nhap hien tai.
        </section>
      )}
    </AppLayout>
  );
}

async function getCurrentProfileOrNull(userId: string) {
  try {
    return await getUserProfileApi(userId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      ["RESOURCE_NOT_FOUND", "USER_NOT_FOUND"].includes(error.code)
    ) {
      return null;
    }

    throw error;
  }
}
