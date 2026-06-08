import { ResetPasswordForm } from "@/features/password-reset";
import { getServerTranslations } from "@/shared/i18n/server";
import { AuthCardFrame } from "./AuthCardFrame";

type ResetPasswordCardProps = {
  token?: string;
};

export async function ResetPasswordCard({ token }: ResetPasswordCardProps) {
  const t = (await getServerTranslations()).auth;

  return (
    <AuthCardFrame
      title={t.resetPasswordTitle}
      description={t.resetPasswordDescription}
    >
      <ResetPasswordForm token={token} />
    </AuthCardFrame>
  );
}
