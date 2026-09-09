"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import {
  createInvitationCodeSchema,
  toggleInvitationCodeSchema,
  deleteInvitationCodeSchema,
} from "@/server/validation/schemas";
import {
  createInvitationCode,
  toggleInvitationCode,
  deleteInvitationCode,
} from "@/server/admin/service";

export type AdminFormState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

function formError(error: unknown): { error: string } {
  if (isApiError(error)) {
    return { error: error.message };
  }
  throw error;
}

function optionalNumber(value: FormDataEntryValue | null): number | null | undefined {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalDate(value: FormDataEntryValue | null): Date | null | undefined {
  if (value === null || value === "") return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function createInvitationCodeAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireAuth();

  const parsed = createInvitationCodeSchema.safeParse({
    code: formData.get("code"),
    maxUses: optionalNumber(formData.get("maxUses")),
    expiresAt: optionalDate(formData.get("expiresAt")),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const invite = await createInvitationCode(user.id, parsed.data);
    revalidatePath("/admin/invites");
    return { success: `Код ${invite.code} создан` };
  } catch (error) {
    return formError(error);
  }
}

export async function toggleInvitationCodeAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireAuth();

  const parsed = toggleInvitationCodeSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    const invite = await toggleInvitationCode(user.id, parsed.data.id);
    revalidatePath("/admin/invites");
    return { success: invite.isActive ? "Код включён" : "Код отключён" };
  } catch (error) {
    return formError(error);
  }
}

export async function deleteInvitationCodeAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireAuth();

  const parsed = deleteInvitationCodeSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await deleteInvitationCode(user.id, parsed.data.id);
    revalidatePath("/admin/invites");
    return { success: "Код удалён" };
  } catch (error) {
    return formError(error);
  }
}