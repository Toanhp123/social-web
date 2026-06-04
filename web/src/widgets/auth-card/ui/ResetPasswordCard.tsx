import { ResetPasswordForm } from "@/features/password-reset";
import { AuthCardFrame } from "./AuthCardFrame";

type ResetPasswordCardProps = {
  token?: string;
};

export function ResetPasswordCard({ token }: ResetPasswordCardProps) {
  return (
    <AuthCardFrame
      title="Dat lai mat khau"
      description="Chon mat khau moi cho tai khoan cua ban."
    >
      <ResetPasswordForm token={token} />
    </AuthCardFrame>
  );
}
