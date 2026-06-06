import Link from "next/link";
import type { VerifyEmailResult } from "@/features/email-verification";
import { ROUTES } from "@/shared/config/routes";
import { AuthCardFrame } from "./AuthCardFrame";

type VerifyEmailCardProps = {
  result: VerifyEmailResult;
};

export function VerifyEmailCard({ result }: VerifyEmailCardProps) {
  return (
    <AuthCardFrame
      eyebrow="Email verification"
      title={result.ok ? "Email verified" : "Verification failed"}
      description={result.message}
    >
      <Link
        href={result.ok ? ROUTES.home : ROUTES.login}
        className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white"
      >
        {result.ok ? "Go to feed" : "Back to login"}
      </Link>
    </AuthCardFrame>
  );
}
