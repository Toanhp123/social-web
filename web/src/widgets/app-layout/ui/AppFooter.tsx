"use client";

import type { AppMessages } from "@/shared/i18n";

type AppFooterProps = {
  t: AppMessages["app"];
};

export function AppFooter({ t }: AppFooterProps) {
  return (
    <footer className="border-subtle border-t px-4 py-4 sm:px-6 lg:px-8">
      <div className="text-muted flex w-full flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>{t.brand}</span>
        <span>{t.footer}</span>
      </div>
    </footer>
  );
}
