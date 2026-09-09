import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "./password";
import { consumeInvitationCode } from "./invitation";
import { createSession } from "./session";
import type { RegisterInput, LoginInput } from "../validation/schemas";

export async function registerUser(input: RegisterInput): Promise<string> {
  const { displayName, email, password, code } = input;
  const lowerEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (existing) {
    throw new ApiError("Пользователь с таким email уже зарегистрирован", 409, "EMAIL_TAKEN");
  }

  const token = await prisma.$transaction(async (tx) => {
    const consumed = await consumeInvitationCode(code, tx);
    if (!consumed) {
      throw new ApiError("Неверный или исчерпанный код приглашения", 400, "INVALID_CODE");
    }

    const passwordHash = await hashPassword(password);
    const user = await tx.user.create({
      data: { email: lowerEmail, displayName, passwordHash, role: "USER" },
    });

    return createSession(user.id, tx);
  });

  return token;
}

export async function loginUser(input: LoginInput): Promise<string> {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError("Неверный email или пароль", 401, "INVALID_CREDENTIALS");
  }

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) {
    throw new ApiError("Неверный email или пароль", 401, "INVALID_CREDENTIALS");
  }

  return createSession(user.id);
}