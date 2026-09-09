"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import {
  todoListCreateSchema,
  todoListUpdateSchema,
  todoListIdSchema,
  todoItemCreateSchema,
  todoItemUpdateSchema,
  todoItemIdSchema,
  reorderItemsSchema,
} from "@/server/validation/schemas";
import {
  createList,
  updateList,
  deleteList,
  addItem,
  updateItem,
  toggleItem,
  deleteItem,
  reorderItems,
} from "@/server/todos/service";

export type TodoFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

function formError(error: unknown): { error: string } {
  if (isApiError(error)) {
    return { error: error.message };
  }
  throw error;
}

export async function createListAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoListCreateSchema.safeParse({
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createList(user.id, parsed.data);
  } catch (error) {
    return formError(error);
  }

  revalidatePath("/");
}

export async function updateListAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoListUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateList(user.id, parsed.data.id, {
      title: parsed.data.title,
    });
  } catch (error) {
    return formError(error);
  }

  revalidatePath("/");
  revalidatePath(`/lists/${parsed.data.id}`);
}

export async function deleteListAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoListIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await deleteList(user.id, parsed.data);
  } catch (error) {
    return formError(error);
  }

  revalidatePath("/");
  redirect("/");
}

export async function addItemAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoItemCreateSchema.safeParse({
    listId: formData.get("listId"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await addItem(user.id, parsed.data.listId, { text: parsed.data.text });
  } catch (error) {
    return formError(error);
  }

  revalidatePath(`/lists/${parsed.data.listId}`);
}

export async function updateItemAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoItemUpdateSchema.safeParse({
    id: formData.get("id"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const item = await updateItem(user.id, parsed.data.id, { text: parsed.data.text });
    revalidatePath(`/lists/${item.listId}`);
  } catch (error) {
    return formError(error);
  }
}

export async function toggleItemAction(itemId: string): Promise<void> {
  const user = await requireAuth();

  const parsed = todoItemIdSchema.safeParse(itemId);
  if (!parsed.success) {
    return;
  }

  const item = await toggleItem(user.id, parsed.data);
  revalidatePath(`/lists/${item.listId}`);
}

export async function deleteItemAction(
  _prevState: TodoFormState,
  formData: FormData,
): Promise<TodoFormState> {
  const user = await requireAuth();

  const parsed = todoItemIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    const item = await deleteItem(user.id, parsed.data);
    revalidatePath(`/lists/${item.listId}`);
  } catch (error) {
    return formError(error);
  }
}

export async function reorderItemsAction(listId: string, orderedItemIds: string[]): Promise<void> {
  const user = await requireAuth();

  const parsed = reorderItemsSchema.safeParse({ listId, orderedItemIds });
  if (!parsed.success) {
    return;
  }

  await reorderItems(user.id, parsed.data.listId, parsed.data.orderedItemIds);
  revalidatePath(`/lists/${parsed.data.listId}`);
}