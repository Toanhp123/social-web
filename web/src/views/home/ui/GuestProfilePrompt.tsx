import Link from "next/link";
import { UserPlus } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";

type HomeMessages = AppMessages["home"];

export function GuestProfilePrompt({ t }: { t: HomeMessages }) {
  return (
    <section className="rounded-card border-surface bg-surface shadow-card border p-5">
      <p className="text-primary text-base font-semibold">
        {t.guestProfileTitle}
      </p>

      <p className="text-muted mt-2 text-sm leading-6">
        {t.guestProfileDescription}
      </p>

      <Link
        href={ROUTES.register}
        className="rounded-pill bg-surface-inverse text-inverse mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800"
      >
        <UserPlus className="size-4" />
        {t.getStarted}
      </Link>
    </section>
  );
}
