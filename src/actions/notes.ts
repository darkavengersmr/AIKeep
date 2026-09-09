"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import { noteCreateSchema, noteUpdateSchema, noteIdSchema } from "@/server/validation/schemas";
import { createNote, updateNote, deleteNote } from "@/server/notes/service";

export type NoteFormState = {
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

function colorValue(formData: FormData): string | null {
  const value = formData.get("color");
  if (value === null || value === "") {
    return null;
  }
  return String(value);
}

function refreshNotes() {
  revalidatePath("/");
  revalidatePath("/notes");
}

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireAuth();

  const parsed = noteCreateSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    color: colorValue(formData),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createNote(user.id, parsed.data);
  } catch (error) {
    return formError(error);
  }

  refreshNotes();
  return { success: "Заметка создана" };
}

export async function updateNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireAuth();

  const parsed = noteUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
    color: colorValue(formData),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateNote(user.id, parsed.data.id, {
      title: parsed.data.title,
      content: parsed.data.content,
      color: parsed.data.color,
    });
  } catch (error) {
    return formError(error);
  }

  refreshNotes();
  return { success: "Заметка обновлена" };
}

export async function deleteNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireAuth();

  const parsed = noteIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await deleteNote(user.id, parsed.data);
  } catch (error) {
    return formError(error);
  }

  refreshNotes();
  return { success: "Заметка удалена" };
}