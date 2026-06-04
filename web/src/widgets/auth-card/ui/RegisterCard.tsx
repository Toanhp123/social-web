import { Suspense } from "react";
import { RegisterForm } from "@/features/register";
import { AuthCardFrame } from "./AuthCardFrame";

export function RegisterCard() {
  return (
    <AuthCardFrame
      title="Dang ky"
      description="Tao tai khoan de bat dau su dung he thong."
    >
      <Suspense fallback={<div className="h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthCardFrame>
  );
}
