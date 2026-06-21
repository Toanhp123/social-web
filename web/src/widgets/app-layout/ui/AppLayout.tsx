"use client";

import type { ReactNode } from "react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type AppLayoutProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  reserveRightSidebar?: boolean;
  contentClassName?: string;
  showPageHeader?: boolean;
  showFooter?: boolean;
};

export function AppLayout({
  title,
  description,
  actions,
  mobileActions,
  children,
  leftSidebar,
  rightSidebar,
  reserveRightSidebar = false,
  contentClassName,
  showPageHeader = true,
  showFooter = false,
}: AppLayoutProps) {
  const t = useTranslations().app;
  const hasRightRail = Boolean(rightSidebar) || reserveRightSidebar;

  return (
    <div className="bg-app text-primary min-h-dvh">
      <AppHeader t={t} actions={actions} mobileActions={mobileActions} />

      <main className="px-3 py-4 sm:px-6 lg:px-0 lg:py-0">
        <div
          className={cn(
            "grid w-full gap-5 lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch lg:gap-0",
            hasRightRail &&
              "xl:grid-cols-[300px_minmax(0,1fr)_320px] 2xl:grid-cols-[320px_minmax(0,1fr)_340px]",
          )}
        >
          {leftSidebar ?? <AppSidebar t={t} />}

          <div
            className={cn(
              "min-w-0 space-y-5 lg:px-6 lg:py-5 xl:px-8",
              contentClassName,
            )}
          >
            {showPageHeader && title && (
              <section className="px-1 py-1 sm:px-0">
                <div>
                  <h1 className="text-primary text-2xl font-bold sm:text-3xl">
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

          {hasRightRail && (
            <aside
              className={cn(
                "hidden min-h-[calc(100dvh-3.5rem)] min-w-0 xl:block",
                rightSidebar && "border-soft bg-surface-elevated/70 border-l",
              )}
              aria-hidden={rightSidebar ? undefined : true}
            >
              <div className="sticky top-14 space-y-4 px-4 py-5">
                {rightSidebar}
              </div>
            </aside>
          )}
        </div>
      </main>

      {showFooter && <AppFooter t={t} />}
    </div>
  );
}
