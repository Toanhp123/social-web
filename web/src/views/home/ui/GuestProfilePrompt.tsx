import Link from "next/link";
import { UserPlus } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";

type HomeMessages = AppMessages["home"];

export function GuestProfilePrompt({ t }: { t: HomeMessages }) {
  return (
    <section className="rounded-card border border-surface bg-surface p-5 shadow-card">
      <p className="text-base font-semibold text-primary">
        {t.guestProfileTitle}
      </p>

      <p className="mt-2 text-sm leading-6 text-muted">
        {t.guestProfileDescription}
      </p>

      <Link
        href={ROUTES.register}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-pill bg-surface-inverse px-4 py-2.5 text-sm font-medium text-inverse hover:bg-zinc-800"
      >
        <UserPlus className="size-4" />
        {t.getStarted}
      </Link>
    </section>
  );
}
