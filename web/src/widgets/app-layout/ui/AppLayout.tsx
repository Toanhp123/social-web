"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  MessageCircle,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { AppSettingsButton } from "@/features/app-settings";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";

type AppLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppLayout({
  title,
  description,
  actions,
  children,
}: AppLayoutProps) {
  const t = useTranslations().app;

  return (
    <div className="flex min-h-screen flex-col bg-app text-primary">
      <AppHeader actions={actions} t={t} />

      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="rounded-card border border-surface bg-surface-elevated px-4 py-4 shadow-card sm:px-5">
            <div>
              <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                  {description}
                </p>
              )}
            </div>
          </section>

          {children}
        </div>
      </main>

      <AppFooter t={t} />
    </div>
  );
}

type AppMessages = ReturnType<typeof useTranslations>["app"];

function AppHeader({
  actions,
  t,
}: {
  actions?: ReactNode;
  t: AppMessages;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-soft bg-surface-elevated px-3 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-control bg-brand text-inverse shadow-card">
            <UserRound className="size-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-wide text-primary sm:inline">
            {t.brand}
          </span>
        </Link>

        <label className="hidden min-w-0 flex-1 items-center gap-3 rounded-pill border border-subtle bg-surface-muted px-4 py-2 text-sm text-muted md:flex md:max-w-md">
          <Search className="size-4 shrink-0" />
          <span className="truncate">{t.searchPlaceholder}</span>
        </label>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 rounded-pill border border-subtle bg-surface-muted p-1 lg:flex">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center gap-2 rounded-pill bg-surface px-3 py-2 text-sm font-medium text-primary shadow-sm"
            >
              <Home className="size-4 text-brand" />
              {t.feed}
            </Link>
            <span className="inline-flex items-center gap-2 rounded-pill px-3 py-2 text-sm text-muted">
              <Users className="size-4" />
              {t.friends}
            </span>
          </nav>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-pill border border-subtle bg-surface text-secondary shadow-sm hover:text-brand"
            aria-label={t.messages}
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-pill border border-subtle bg-surface text-secondary shadow-sm hover:text-brand"
            aria-label={t.notifications}
          >
            <Bell className="size-4" />
          </button>
          <AppSettingsButton />
          {actions}
        </div>
      </div>
    </header>
  );
}

function AppFooter({ t }: { t: AppMessages }) {
  return (
    <footer className="border-t border-subtle px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{t.brand}</span>
        <span>{t.footer}</span>
      </div>
    </footer>
  );
}

