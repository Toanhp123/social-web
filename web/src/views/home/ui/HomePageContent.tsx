"use client";

import Link from "next/link";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import { CreatePostComposer } from "@/features/create-post";
import { LogoutButton } from "@/features/logout";
import type { CurrentSessionUser } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { AppLayout } from "@/widgets/app-layout";
import { PostFeed } from "@/widgets/post-feed";
import { GuestComposerPrompt } from "./GuestComposerPrompt";
import { GuestProfilePrompt } from "./GuestProfilePrompt";
import { HomeRail } from "./HomeRail";

type HomePageContentProps = {
  currentUser: CurrentSessionUser | null;
};

type HomeMessages = ReturnType<typeof useTranslations>["home"];

export function HomePageContent({ currentUser }: HomePageContentProps) {
  const t = useTranslations().home;

  return (
    <AppLayout
      title={t.title}
      description={t.description}
      actions={
        currentUser ? (
          <AuthenticatedActions t={t} />
        ) : (
          <GuestActions t={t} />
        )
      }
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:items-start">
        <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-24 xl:block">
          <HomeRail currentUserEmail={currentUser?.email} t={t} />
        </aside>

        <main className="min-w-0 space-y-5">
          {currentUser ? <CreatePostComposer /> : <GuestComposerPrompt t={t} />}
          <PostFeed canInteract={Boolean(currentUser)} />
        </main>

        <aside className="min-w-0 xl:sticky xl:top-24">
          {currentUser ? (
            <ProfileShortcutCard email={currentUser.email} t={t} />
          ) : (
            <GuestProfilePrompt t={t} />
          )}
        </aside>
      </div>
    </AppLayout>
  );
}

function AuthenticatedActions({ t }: { t: HomeMessages }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.profile}
        className="inline-flex h-10 items-center rounded-pill border border-subtle bg-surface px-3 text-sm font-medium text-secondary shadow-sm transition hover:text-brand"
      >
        {t.profile}
      </Link>

      <LogoutButton />
    </div>
  );
}

function GuestActions({ t }: { t: HomeMessages }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.login}
        className="inline-flex h-10 items-center gap-2 rounded-pill border border-subtle bg-surface px-3 text-sm font-medium text-secondary shadow-sm transition hover:text-brand"
      >
        <LogIn className="size-4" />
        {t.login}
      </Link>

      <Link
        href={ROUTES.register}
        className="hidden h-10 items-center gap-2 rounded-pill bg-brand px-3 text-sm font-medium text-inverse shadow-sm transition hover:bg-brand-hover sm:inline-flex"
      >
        <UserPlus className="size-4" />
        {t.register}
      </Link>
    </div>
  );
}

function ProfileShortcutCard({ email, t }: { email: string; t: HomeMessages }) {
  return (
    <section className="rounded-card border border-surface bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-pill bg-surface-muted text-muted">
          <UserRound className="size-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-primary">{t.profileTitle}</h2>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
      </div>

      <Link
        href={ROUTES.profile}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-pill bg-brand px-4 text-sm font-medium text-inverse transition hover:bg-brand-hover"
      >
        {t.viewProfile}
      </Link>
    </section>
  );
}

