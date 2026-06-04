import { ResetPasswordCard } from "@/widgets/reset-password-card";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <ResetPasswordCard token={token} />
    </main>
  );
}
