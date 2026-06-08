import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export function GuestComposerPrompt() {
  return (
    <section className="rounded-card border border-surface bg-surface p-5 shadow-card">
      <p className="text-base font-semibold text-primary">
        Chia sẻ câu chuyện của bạn
      </p>

      <p className="mt-1 text-sm leading-6 text-muted">
        Đăng nhập để đăng bài, tải ảnh/video và tham gia trò chuyện.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand px-4 py-2.5 text-sm font-medium text-inverse hover:bg-brand-hover"
        >
          <LogIn className="size-4" />
          Đăng nhập
        </Link>

        <Link
          href={ROUTES.register}
          className="inline-flex items-center justify-center gap-2 rounded-pill border border-subtle px-4 py-2.5 text-sm font-medium text-secondary hover:bg-surface-soft"
        >
          <UserPlus className="size-4" />
          Tạo tài khoản
        </Link>
      </div>
    </section>
  );
}
