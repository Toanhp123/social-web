import Link from "next/link";
import type { VerifyEmailResult } from "@/features/email-verification";
import { ROUTES } from "@/shared/config/routes";
import { getServerTranslations } from "@/shared/i18n/server";
import { AuthCardFrame } from "./AuthCardFrame";

type VerifyEmailCardProps = {
  result: VerifyEmailResult;
};

export async function VerifyEmailCard({ result }: VerifyEmailCardProps) {
  const t = (await getServerTranslations()).auth;

  return (
    <AuthCardFrame
      eyebrow={t.emailVerification}
      title={result.ok ? t.emailVerified : t.verificationFailed}
      description={result.message}
    >
      <Link
        href={result.ok ? ROUTES.home : ROUTES.login}
        className="block rounded-control bg-brand px-4 py-3 text-center font-medium text-inverse hover:bg-brand-hover"
      >
        {result.ok ? t.goToFeed : t.backToLogin}
      </Link>
    </AuthCardFrame>
  );
}
