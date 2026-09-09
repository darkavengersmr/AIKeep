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

export const noteColorSchema = z.enum([
  "#fef3c7",
  "#d1fadf",
  "#dbeafe",
  "#fce7f3",
  "#e5e7eb",
]);

export const noteCreateSchema = z.object({
  title: z.string().trim().max(200, "Заголовок максимум 200 символов").nullable().optional(),
  content: z.string().trim().max(20000, "Текст максимум 20000 символов").nullable().optional(),
  color: noteColorSchema.nullable().optional(),
});

export const noteUpdateSchema = noteCreateSchema.extend({
  id: z.string().trim().min(1, "Некорректный идентификатор"),
});

export const noteIdSchema = z.string().trim().min(1, "Некорректный идентификатор");

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;

export const idSchema = z.string().trim().min(1, "Некорректный идентификатор");

export const todoListIdSchema = idSchema;
export const todoItemIdSchema = idSchema;

export const todoListTitleSchema = z
  .string()
  .trim()
  .min(1, "Название обязательно")
  .max(200, "Название максимум 200 символов");

export const todoListCreateSchema = z.object({
  title: todoListTitleSchema,
});

export const todoListUpdateSchema = z.object({
  id: idSchema,
  title: todoListTitleSchema,
});

export const todoItemCreateSchema = z.object({
  listId: idSchema,
  text: z.string().trim().min(1, "Текст задачи обязателен").max(500, "Текст максимум 500 символов"),
});

export const todoItemUpdateSchema = z.object({
  id: idSchema,
  text: z.string().trim().min(1, "Текст задачи обязателен").max(500, "Текст максимум 500 символов"),
});

export const reorderItemsSchema = z.object({
  listId: idSchema,
  orderedItemIds: z.array(idSchema).min(1, "Некорректный порядок элементов"),
});

export type TodoListCreateInput = z.infer<typeof todoListCreateSchema>;
export type TodoListUpdateInput = z.infer<typeof todoListUpdateSchema>;
export type TodoItemCreateInput = z.infer<typeof todoItemCreateSchema>;
export type TodoItemUpdateInput = z.infer<typeof todoItemUpdateSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;

export const memberEmailSchema = z
  .string()
  .trim()
  .email("Некорректный email")
  .toLowerCase()
  .max(254);

export const addMemberSchema = z.object({
  listId: idSchema,
  email: memberEmailSchema,
});

export const memberRoleSchema = z.enum(["EDITOR", "VIEWER"]);

export const removeMemberSchema = z.object({
  listId: idSchema,
  userId: idSchema,
});

export const changeMemberRoleSchema = z.object({
  listId: idSchema,
  userId: idSchema,
  role: memberRoleSchema,
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;