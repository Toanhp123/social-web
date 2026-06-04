import { ForgotPasswordForm } from "@/features/password-reset";
import { AuthCardFrame } from "./AuthCardFrame";

export function ForgotPasswordCard() {
  return (
    <AuthCardFrame
      title="Quen mat khau"
      description="Nhap email de nhan lien ket dat lai mat khau."
    >
      <ForgotPasswordForm />
    </AuthCardFrame>
  );
}
