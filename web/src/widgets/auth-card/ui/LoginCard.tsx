import { Suspense } from "react";
import { LoginForm } from "@/features/login";
import { getServerTranslations } from "@/shared/i18n/server";
import { AuthCardFrame } from "./AuthCardFrame";

export async function LoginCard() {
  const t = (await getServerTranslations()).auth;

  return (
    <AuthCardFrame
      title={t.loginTitle}
      description={t.loginDescription}
    >
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthCardFrame>
  );
}
