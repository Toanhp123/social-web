import { RegisterForm } from "@/features/register";

export function RegisterCard() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Đăng ký</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Tạo tài khoản để bắt đầu sử dụng hệ thống.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>
    </section>
  );
}
