import Link from "next/link";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import { LogoutButton } from "@/features/logout";
import { CreatePostComposer } from "@/features/create-post";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";
import { ROUTES } from "@/shared/config/routes";
import { HomeRail } from "./HomeRail";
import { GuestComposerPrompt } from "./GuestComposerPrompt";
import { GuestProfilePrompt } from "./GuestProfilePrompt";
import { getCurrentSessionUserOrNull } from "../server/server";

export async function HomePage() {
  const currentUser = await getCurrentSessionUserOrNull();

  return (
    <AppLayout
      title="Bảng tin"
      description="Đọc cập nhật mới từ cộng đồng. Đăng nhập khi bạn muốn đăng bài, thả cảm xúc hoặc bình luận."
      actions={currentUser ? <AuthenticatedActions /> : <GuestActions />}
    >
      <div
        className={[
          "grid gap-5",
          "xl:grid-cols-[280px_minmax(0,1fr)_360px]",
          "xl:items-start",
        ].join(" ")}
      >
        <aside
          className={[
            "hidden min-w-0 space-y-4",
            "xl:sticky xl:top-24 xl:block",
          ].join(" ")}
        >
          <HomeRail currentUserEmail={currentUser?.email} />
        </aside>

        <main className="min-w-0 space-y-5">
          {currentUser ? <CreatePostComposer /> : <GuestComposerPrompt />}
          <PostFeed canInteract={Boolean(currentUser)} />
        </main>

        <aside className="min-w-0 xl:sticky xl:top-24">
          {currentUser ? (
            <ProfileShortcutCard email={currentUser.email} />
          ) : (
            <GuestProfilePrompt />
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

function AuthenticatedActions() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.profile}
        className={[
          "inline-flex h-10 items-center rounded-pill",
          "border border-subtle bg-surface px-3",
          "text-sm font-medium text-secondary shadow-sm",
          "transition hover:text-brand",
        ].join(" ")}
      >
        Profile
      </Link>

      <LogoutButton />
    </div>
  );
}

function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.login}
        className={[
          "inline-flex h-10 items-center gap-2 rounded-pill",
          "border border-subtle bg-surface px-3",
          "text-sm font-medium text-secondary shadow-sm",
          "transition hover:text-brand",
        ].join(" ")}
      >
        <LogIn className="size-4" />
        Đăng nhập
      </Link>

      <Link
        href={ROUTES.register}
        className={[
          "hidden h-10 items-center gap-2 rounded-pill",
          "bg-brand px-3 text-sm font-medium text-inverse shadow-sm",
          "transition hover:bg-brand-hover",
          "sm:inline-flex",
        ].join(" ")}
      >
        <UserPlus className="size-4" />
        Đăng ký
      </Link>
    </div>
  );
}

function ProfileShortcutCard({ email }: { email: string }) {
  return (
    <section
      className={[
        "rounded-card border border-surface bg-surface p-4",
        "shadow-card",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "grid size-11 place-items-center rounded-pill",
            "bg-surface-muted text-muted",
          ].join(" ")}
        >
          <UserRound className="size-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-primary">Trang cá nhân</h2>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
      </div>

      <Link
        href={ROUTES.profile}
        className={[
          "mt-4 inline-flex h-10 w-full items-center justify-center rounded-pill",
          "bg-brand px-4 text-sm font-medium text-inverse",
          "transition hover:bg-brand-hover",
        ].join(" ")}
      >
        Xem profile
      </Link>
    </section>
  );
}
