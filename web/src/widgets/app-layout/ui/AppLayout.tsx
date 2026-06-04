import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

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
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <AppHeader actions={actions} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
              )}
            </div>
          </section>

          {children}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

function AppHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href={ROUTES.dashboard} className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600">
            <UserRound className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-wide">
            Social Web
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 sm:flex">
            <Link
              href={ROUTES.dashboard}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </nav>

          {actions}
        </div>
      </div>
    </header>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-zinc-800 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Social Web</span>
        <span>Profile, feed, and community tools.</span>
      </div>
    </footer>
  );
}
