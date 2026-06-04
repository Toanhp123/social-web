import Link from "next/link";
import { verifyEmailApi } from "@/features/email-verification";
import { ROUTES } from "@/shared/config/routes";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = await verifyEmailApi(token);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <section className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
        <p className="text-sm font-medium text-blue-300">
          Email verification
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          {result.ok ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {result.message}
        </p>
        <Link
          href={result.ok ? ROUTES.dashboard : ROUTES.login}
          className="mt-8 block rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white"
        >
          {result.ok ? "Go to dashboard" : "Back to login"}
        </Link>
      </section>
    </main>
  );
}
