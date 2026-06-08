import { ResetPasswordCard } from "@/widgets/auth-card";

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
    <main className="flex min-h-screen items-center justify-center bg-app px-4">
      <ResetPasswordCard token={token} />
    </main>
  );
}
