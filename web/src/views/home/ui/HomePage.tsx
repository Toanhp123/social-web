import Link from "next/link";
import { BellDot, LogIn, Sparkles, UserPlus, UsersRound } from "lucide-react";
import { LogoutButton } from "@/features/logout";
import { CreatePostComposer } from "@/features/create-post";
import { getCurrentSessionUser } from "@/entities/session/server";
import { getUserProfileApi } from "@/features/profile/server";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";
import { ProfilePanel } from "@/widgets/profile-panel";
import { ApiError } from "@/shared/api/api-error";
import { ROUTES } from "@/shared/config/routes";

export async function HomePage() {
  const currentUser = await getCurrentSessionUserOrNull();
  const profile = currentUser
    ? await getCurrentProfileOrNull(currentUser.id)
    : null;

  return (
    <AppLayout
      title="Bang tin"
      description="Doc cap nhat moi tu cong dong. Dang nhap khi ban muon dang bai, tha cam xuc hoac binh luan."
      actions={
        currentUser ? (
          <LogoutButton />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.login}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 shadow-sm transition hover:text-blue-600"
            >
              <LogIn className="size-4" />
              Dang nhap
            </Link>
            <Link
              href={ROUTES.register}
              className="hidden h-10 items-center gap-2 rounded-full bg-blue-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 sm:inline-flex"
            >
              <UserPlus className="size-4" />
              Dang ky
            </Link>
          </div>
        )
      }
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:items-start">
        <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-24 xl:block">
          <HomeRail currentUserEmail={currentUser?.email} />
        </aside>

        <div className="min-w-0 space-y-5">
          {currentUser ? <CreatePostComposer /> : <GuestComposerPrompt />}
          <PostFeed canInteract={Boolean(currentUser)} />
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24">
          {currentUser ? (
            <ProfilePanel
              currentUser={currentUser}
              initialProfile={profile}
              variant="sidebar"
            />
          ) : (
            <GuestProfilePrompt />
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

function HomeRail({ currentUserEmail }: { currentUserEmail?: string }) {
  const items = [
    { icon: BellDot, label: "Thong bao moi", meta: "Theo doi cac cap nhat" },
    { icon: UsersRound, label: "Cong dong", meta: "Kham pha chu de yeu thich" },
    { icon: Sparkles, label: "Noi bat", meta: "Bai viet duoc quan tam" },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-zinc-200/70">
        <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
          {currentUserEmail ? "Xin chao" : "Social Web"}
        </p>
        <h2 className="mt-2 text-lg font-semibold wrap-break-word text-zinc-950">
          {currentUserEmail ?? "Bang tin cong khai"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {currentUserEmail
            ? "Chon mot luong cap nhat, viet bai moi hoac cham lai profile."
            : "Ban co the doc feed truoc, dang nhap khi muon tuong tac."}
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

function GuestComposerPrompt() {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-sm shadow-zinc-200/70">
      <p className="text-base font-semibold text-zinc-950">
        Chia se cau chuyen cua ban
      </p>
      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Dang nhap de dang bai, tai anh/video va tham gia tro chuyen.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <LogIn className="size-4" />
          Dang nhap
        </Link>
        <Link
          href={ROUTES.register}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <UserPlus className="size-4" />
          Tao tai khoan
        </Link>
      </div>
    </section>
  );
}

function GuestProfilePrompt() {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-sm shadow-zinc-200/70">
      <p className="text-base font-semibold text-zinc-950">
        Tao profile cua ban
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Co tai khoan de luu reaction, dang bai, binh luan va quan ly trang ca
        nhan.
      </p>
      <Link
        href={ROUTES.register}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        <UserPlus className="size-4" />
        Bat dau
      </Link>
    </section>
  );
}

async function getCurrentSessionUserOrNull() {
  try {
    return await getCurrentSessionUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

async function getCurrentProfileOrNull(userId: string) {
  try {
    return await getUserProfileApi(userId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      ["RESOURCE_NOT_FOUND", "USER_NOT_FOUND"].includes(error.code)
    ) {
      return null;
    }

    throw error;
  }
}
