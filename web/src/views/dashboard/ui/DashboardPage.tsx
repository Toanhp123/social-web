import { LogoutButton } from "@/features/logout";
import { CreatePostComposer } from "@/features/create-post";
import { getCurrentSessionUser } from "@/entities/session/server";
import { getUserProfileApi } from "@/features/profile/server";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";
import { ProfilePanel } from "@/widgets/profile-panel";
import { ApiError } from "@/shared/api/api-error";
import { BellDot, Sparkles, UsersRound } from "lucide-react";

export async function DashboardPage() {
  const currentUser = await getCurrentSessionUser();
  const profile = currentUser
    ? await getCurrentProfileOrNull(currentUser.id)
    : null;

  return (
    <AppLayout
      title="Bang tin"
      description="Cap nhat cau chuyen moi, chia se khoanh khac va giu profile cua ban luon gon gang."
      actions={<LogoutButton />}
    >
      {currentUser ? (
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:items-start">
          <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-24 xl:block">
            <DashboardRail currentUserEmail={currentUser.email} />
          </aside>

          <div className="min-w-0 space-y-5">
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
        <section className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600 shadow-sm">
          Khong doc duoc phien dang nhap hien tai.
        </section>
      )}
    </AppLayout>
  );
}

function DashboardRail({ currentUserEmail }: { currentUserEmail: string }) {
  const items = [
    { icon: BellDot, label: "Thong bao moi", meta: "3 cap nhat dang cho" },
    { icon: UsersRound, label: "Cong dong", meta: "Theo doi chu de yeu thich" },
    { icon: Sparkles, label: "Noi bat", meta: "Bai viet duoc quan tam" },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-zinc-200/70">
        <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
          Xin chao
        </p>
        <h2 className="mt-2 text-lg font-semibold wrap-break-word text-zinc-950">
          {currentUserEmail}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Chon mot luong cap nhat, viet bai moi hoac cham lai profile.
        </p>
      </section>

      <section className="rounded-2xl border border-white bg-white p-3 shadow-sm shadow-zinc-200/70">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-zinc-50"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-zinc-950">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {item.meta}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
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
