import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().trim().min(3, "Имя минимум 3 символа").max(50, "Имя максимум 50 символов"),
  email: z.string().trim().email("Некорректный email").toLowerCase().max(254),
  password: z.string().min(8, "Пароль минимум 8 символов").max(200),
  code: z.string().trim().min(6, "Код минимум 6 символов").max(20, "Код максимум 20 символов"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Некорректный email").toLowerCase().max(254),
  password: z.string().min(1, "Введите пароль").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;