"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import {
  addMemberSchema,
  removeMemberSchema,
  changeMemberRoleSchema,
} from "@/server/validation/schemas";
import {
  addMember,
  removeMember,
  changeMemberRole,
} from "@/server/members/service";

export type MembersFormState = {
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

export async function addMemberAction(
  _prevState: MembersFormState,
  formData: FormData,
): Promise<MembersFormState> {
  const user = await requireAuth();

  const parsed = addMemberSchema.safeParse({
    listId: formData.get("listId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await addMember(user.id, parsed.data.listId, { email: parsed.data.email });
  } catch (error) {
    return formError(error);
  }

  revalidatePath(`/lists/${parsed.data.listId}`);
  return { success: "Участник добавлен" };
}

export async function removeMemberAction(
  _prevState: MembersFormState,
  formData: FormData,
): Promise<MembersFormState> {
  const user = await requireAuth();

  const parsed = removeMemberSchema.safeParse({
    listId: formData.get("listId"),
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await removeMember(user.id, parsed.data.listId, parsed.data.userId);
  } catch (error) {
    return formError(error);
  }

  revalidatePath(`/lists/${parsed.data.listId}`);
  return { success: "Участник удалён" };
}

export async function changeMemberRoleAction(
  _prevState: MembersFormState,
  formData: FormData,
): Promise<MembersFormState> {
  const user = await requireAuth();

  const parsed = changeMemberRoleSchema.safeParse({
    listId: formData.get("listId"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await changeMemberRole(
      user.id,
      parsed.data.listId,
      parsed.data.userId,
      parsed.data.role,
    );
  } catch (error) {
    return formError(error);
  }

  revalidatePath(`/lists/${parsed.data.listId}`);
  return { success: "Роль участника изменена" };
}