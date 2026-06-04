import { ResetPasswordForm } from "@/features/password-reset";

type ResetPasswordCardProps = {
  token?: string;
};

export function ResetPasswordCard({ token }: ResetPasswordCardProps) {
  return (
    <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Đặt lại mật khẩu</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Chọn mật khẩu mới cho tài khoản của bạn.
      </p>

      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </section>
  );
}
