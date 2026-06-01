import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(5, "Họ tên phải có ít nhất 5 ký tự."),
  email: z.email("Email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  username: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmedValue = value.trim();

      return trimmedValue ? trimmedValue : undefined;
    },
    z.string().min(6, "Username phải có ít nhất 6 ký tự.").optional(),
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
