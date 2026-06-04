import { verifyEmailApi } from "@/features/email-verification";
import { VerifyEmailCard } from "@/widgets/auth-card";

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
      <VerifyEmailCard result={result} />
    </main>
  );
}
