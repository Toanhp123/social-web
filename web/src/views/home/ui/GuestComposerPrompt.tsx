import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";

type HomeMessages = AppMessages["home"];

export function GuestComposerPrompt({ t }: { t: HomeMessages }) {
  return (
    <section className="rounded-card border-surface bg-surface shadow-card border p-5">
      <p className="text-primary text-base font-semibold">
        {t.guestComposerTitle}
      </p>

      <p className="text-muted mt-1 text-sm leading-6">
        {t.guestComposerDescription}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.login}
          className="rounded-pill bg-brand text-inverse hover:bg-brand-hover inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
        >
          <LogIn className="size-4" />
          {t.login}
        </Link>

        <Link
          href={ROUTES.register}
          className="rounded-pill border-subtle text-secondary hover:bg-surface-soft inline-flex items-center justify-center gap-2 border px-4 py-2.5 text-sm font-medium"
        >
          <UserPlus className="size-4" />
          {t.createAccount}
        </Link>
      </div>
    </section>
  );
}
