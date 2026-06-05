import { LogoutButton } from "@/features/logout";
import { CreatePostComposer } from "@/features/create-post";
import { getCurrentSessionUser } from "@/entities/session/server";
import { getUserProfileApi } from "@/features/profile/server";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";
import { ProfilePanel } from "@/widgets/profile-panel";
import { ApiError } from "@/shared/api/api-error";

export async function DashboardPage() {
  const currentUser = await getCurrentSessionUser();
  const profile = currentUser
    ? await getCurrentProfileOrNull(currentUser.id)
    : null;

  return (
    <AppLayout
      title="Bang tin"
      description="Dang bai, theo doi cap nhat moi va quan ly profile cua ban."
      actions={<LogoutButton />}
    >
      {currentUser ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <CreatePostComposer />
            <PostFeed />
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <ProfilePanel
              currentUser={currentUser}
              initialProfile={profile}
              variant="sidebar"
            />
          </aside>
        </div>
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
