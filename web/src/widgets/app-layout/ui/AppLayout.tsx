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
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-zinc-950">
      <AppHeader actions={actions} />

      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <section className="rounded-2xl border border-white bg-white/85 px-4 py-4 shadow-sm shadow-zinc-200/70 sm:px-5">
            <div>
              <h1 className="text-xl font-semibold text-zinc-950 sm:text-2xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
                  {description}
                </p>
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
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 px-3 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href={ROUTES.dashboard} className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <UserRound className="size-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-wide text-zinc-950 sm:inline">
            Social Web
          </span>
        </Link>

        <label className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-zinc-100/80 px-4 py-2 text-sm text-zinc-500 md:flex md:max-w-md">
          <Search className="size-4 shrink-0" />
          <span className="truncate">Tim ban be, bai viet, nhom...</span>
        </label>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1 lg:flex">
            <Link
              href={ROUTES.dashboard}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm"
            >
              <Home className="size-4 text-blue-600" />
              Bang tin
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-500">
              <Users className="size-4" />
              Ban be
            </span>
          </nav>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:text-blue-600"
            aria-label="Tin nhan"
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:text-blue-600"
            aria-label="Thong bao"
          >
            <Bell className="size-4" />
          </button>
          {actions}
        </div>
      </div>
    </header>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Social Web</span>
        <span>Profile, feed, and community tools.</span>
      </div>
    </footer>
  );
}
