"use client";

import type { ReactNode } from "react";
import { useTranslations } from "@/shared/i18n";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";

type AppLayoutProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  children: ReactNode;
  showPageHeader?: boolean;
  showFooter?: boolean;
};

export function AppLayout({
  title,
  description,
  actions,
  mobileActions,
  children,
  showPageHeader = true,
  showFooter = false,
}: AppLayoutProps) {
  const t = useTranslations().app;

  return (
    <div className="bg-app text-primary min-h-dvh">
      <AppHeader t={t} actions={actions} mobileActions={mobileActions} />

      <main className="px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          {showPageHeader && title && (
            <section className="rounded-card border-surface-border bg-surface-elevated shadow-card border px-4 py-4 sm:px-5">
              <div>
                <h1 className="text-primary text-xl font-semibold sm:text-2xl">
                  {title}
                </h1>

                {description && (
                  <p className="text-muted mt-1 max-w-2xl text-sm leading-6">
                    {description}
                  </p>
                )}
              </div>
            </section>
          )}

          {children}
        </div>
      </main>

      {showFooter && <AppFooter t={t} />}
    </div>
  );
}
