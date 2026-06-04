import { Suspense } from "react";
import { LoginForm } from "@/features/login";
import { AuthCardFrame } from "./AuthCardFrame";

export function LoginCard() {
  return (
    <AuthCardFrame
      title="Dang nhap"
      description="Dang nhap de tiep tuc vao he thong."
    >
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthCardFrame>
  );
}
