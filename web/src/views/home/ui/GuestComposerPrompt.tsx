import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export function GuestComposerPrompt() {
  return (
    <section className="rounded-2xl border border-white bg-white p-5 shadow-sm shadow-zinc-200/70">
      <p className="text-base font-semibold text-zinc-950">
        Chia sẻ câu chuyện của bạn
      </p>

      <p className="mt-1 text-sm leading-6 text-zinc-500">
        Đăng nhập để đăng bài, tải ảnh/video và tham gia trò chuyện.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          <LogIn className="size-4" />
          Đăng nhập
        </Link>

        <Link
          href={ROUTES.register}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <UserPlus className="size-4" />
          Tạo tài khoản
        </Link>
      </div>
    </section>
  );
}
