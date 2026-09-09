"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { registerSchema, loginSchema } from "@/server/validation/schemas";
import { registerUser, loginUser } from "@/server/auth/service";
import { destroySession, SESSION_COOKIE } from "@/server/auth/session";
import { isApiError } from "@/lib/errors";
import { getCurrentUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

function formError(error: unknown): { error: string } {
  if (isApiError(error)) {
    return { error: error.message };
  }
  throw error;
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const token = await registerUser(parsed.data);
    await setSessionCookie(token);
  } catch (error) {
    return formError(error);
  }

  redirect("/");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const token = await loginUser(parsed.data);
    await setSessionCookie(token);
  } catch (error) {
    return formError(error);
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      await destroySession(token);
    }
  }
  await clearSessionCookie();
  redirect("/login");
}