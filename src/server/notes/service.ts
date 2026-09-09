import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import type { NoteCreateInput } from "../validation/schemas";

export async function listNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createNote(userId: string, input: NoteCreateInput) {
  return prisma.note.create({
    data: {
      userId,
      title: input.title ?? null,
      content: input.content ?? null,
      color: input.color ?? null,
    },
  });
}

export async function updateNote(userId: string, id: string, input: NoteCreateInput) {
  const data = {
    ...(input.title !== undefined ? { title: input.title ?? null } : {}),
    ...(input.content !== undefined ? { content: input.content ?? null } : {}),
    ...(input.color !== undefined ? { color: input.color ?? null } : {}),
  };

  if (Object.keys(data).length === 0) {
    const existing = await prisma.note.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!existing) {
      throw new ApiError("Заметка не найдена", 404, "NOTE_NOT_FOUND");
    }
    return existing;
  }

  const { count } = await prisma.note.updateMany({
    where: { id, userId, deletedAt: null },
    data,
  });
  if (count === 0) {
    throw new ApiError("Заметка не найдена", 404, "NOTE_NOT_FOUND");
  }
  return prisma.note.findUniqueOrThrow({ where: { id } });
}

export async function deleteNote(userId: string, id: string): Promise<void> {
  const { count } = await prisma.note.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (count === 0) {
    throw new ApiError("Заметка не найдена", 404, "NOTE_NOT_FOUND");
  }
}