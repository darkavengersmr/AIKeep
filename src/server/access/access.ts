import type { MemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

export async function requireMember(userId: string, listId: string) {
  const membership = await prisma.todoListMember.findUnique({
    where: { listId_userId: { listId, userId } },
  });
  if (!membership) {
    throw new ApiError("Список не найден", 404, "LIST_NOT_FOUND");
  }
  return membership;
}

const EDITOR_ROLES: readonly MemberRole[] = ["OWNER", "EDITOR"];

export async function requireEditor(
  userId: string,
  listId: string,
  message = "Недостаточно прав для изменения списка",
) {
  const membership = await requireMember(userId, listId);
  if (!EDITOR_ROLES.includes(membership.role)) {
    throw new ApiError(message, 403, "FORBIDDEN");
  }
  return membership;
}

export async function requireOwner(
  userId: string,
  listId: string,
  message = "Только владелец может выполнить это действие",
) {
  const membership = await requireMember(userId, listId);
  if (membership.role !== "OWNER") {
    throw new ApiError(message, 403, "FORBIDDEN");
  }
  return membership;
}