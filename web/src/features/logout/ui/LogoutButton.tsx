"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { useLogoutMutation } from "../model/use-logout-mutation";

export function LogoutButton() {
  const logoutMutation = useLogoutMutation();
  const t = useTranslations().logout;

  return (
    <button
      type="button"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="rounded-pill border-subtle bg-surface text-secondary shadow-control hover:text-danger inline-flex h-10 items-center gap-2 border px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {logoutMutation.isPending ? t.pending : t.action}
    </button>
  );
}
