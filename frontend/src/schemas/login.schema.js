import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  password: z
    .string()
    .min(4, "Mật khẩu tối thiểu 4 ký tự")
});
