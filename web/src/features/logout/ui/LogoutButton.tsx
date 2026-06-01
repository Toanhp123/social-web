"use client";

import { LogOut } from "lucide-react";
import { useLogoutMutation } from "../model/use-logout-mutation";

export function LogoutButton() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      type="button"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900 disabled:pointer-events-none disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
