"use client";

import Link from "next/link";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import { CreatePostComposer } from "@/features/create-post";
import { LogoutButton } from "@/features/logout";
import type { CurrentSessionUser } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
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
        currentUser ? <AuthenticatedActions t={t} /> : <GuestActions t={t} />
      }
      showPageHeader={false}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:items-start">
        <aside className="hidden min-w-0 xl:sticky xl:top-20 xl:block">
          <HomeRail currentUserEmail={currentUser?.email} t={t} />
        </aside>

        <main className="min-w-0 space-y-5">
          {currentUser ? <CreatePostComposer /> : <GuestComposerPrompt t={t} />}

          <PostFeed canInteract={Boolean(currentUser)} />
        </main>

        <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:block">
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
        className={cn(
          "rounded-pill inline-flex h-10 items-center border px-3 text-sm font-medium shadow-sm transition",
          "border-subtle bg-surface text-secondary hover:text-brand",
        )}
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
        className={cn(
          "rounded-pill inline-flex h-10 items-center gap-2 border px-3 text-sm font-medium shadow-sm transition",
          "border-subtle bg-surface text-secondary hover:text-brand",
        )}
      >
        <LogIn className="size-4" />
        {t.login}
      </Link>

      <Link
        href={ROUTES.register}
        className={cn(
          "rounded-pill hidden h-10 items-center gap-2 px-3 text-sm font-medium shadow-sm transition sm:inline-flex",
          "bg-brand text-inverse hover:bg-brand-hover",
        )}
      >
        <UserPlus className="size-4" />
        {t.register}
      </Link>
    </div>
  );
}

function ProfileShortcutCard({ email, t }: { email: string; t: HomeMessages }) {
  return (
    <section className="rounded-card border-surface bg-surface shadow-card border p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-pill bg-surface-muted text-muted grid size-11 place-items-center">
          <UserRound className="size-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-primary font-semibold">{t.profileTitle}</h2>
          <p className="text-muted truncate text-sm">{email}</p>
        </div>
      </div>

      <Link
        href={ROUTES.profile}
        className={cn(
          "rounded-pill mt-4 inline-flex h-10 w-full items-center justify-center px-4 text-sm font-medium transition",
          "bg-brand text-inverse hover:bg-brand-hover",
        )}
      >
        {t.viewProfile}
      </Link>
    </section>
  );
}
