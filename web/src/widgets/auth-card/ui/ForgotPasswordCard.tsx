import { ForgotPasswordForm } from "@/features/password-reset";
import { getServerTranslations } from "@/shared/i18n/server";
import { AuthCardFrame } from "./AuthCardFrame";

export async function ForgotPasswordCard() {
  const t = (await getServerTranslations()).auth;

  return (
    <AuthCardFrame
      title={t.forgotPasswordTitle}
      description={t.forgotPasswordDescription}
    >
      <ForgotPasswordForm />
    </AuthCardFrame>
  );
}
