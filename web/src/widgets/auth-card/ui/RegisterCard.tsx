import { Suspense } from "react";
import { RegisterForm } from "@/features/register";
import { getServerTranslations } from "@/shared/i18n/server";
import { AuthCardFrame } from "./AuthCardFrame";

export async function RegisterCard() {
  const t = (await getServerTranslations()).auth;

  return (
    <AuthCardFrame
      title={t.registerTitle}
      description={t.registerDescription}
    >
      <Suspense fallback={<div className="h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthCardFrame>
  );
}
