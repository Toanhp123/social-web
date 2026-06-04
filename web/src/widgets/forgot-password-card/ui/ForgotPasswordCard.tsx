import { ForgotPasswordForm } from "@/features/password-reset";

export function ForgotPasswordCard() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Quên mật khẩu</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Nhập email để nhận liên kết đặt lại mật khẩu.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
