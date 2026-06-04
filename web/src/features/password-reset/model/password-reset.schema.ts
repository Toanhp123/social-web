import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.email("Email không hợp lệ."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});
