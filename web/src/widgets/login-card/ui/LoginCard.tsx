import { LoginForm } from "@/features/login";

export function LoginCard() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Đăng nhập</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Đăng nhập để tiếp tục vào hệ thống.
      </p>

      <div className="mt-8">
        <LoginForm />
      </div>
    </section>
  );
}
