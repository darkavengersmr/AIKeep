import type { MemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { requireMember, requireOwner } from "@/server/access/access";

export async function listMembers(userId: string, listId: string) {
  const membership = await requireMember(userId, listId);

  const members = await prisma.todoListMember.findMany({
    where: { listId },
    include: { user: { select: { id: true, email: true, displayName: true } } },
    orderBy: { createdAt: "asc" },
  });

  const canSeeEmails = membership.role === "OWNER";

  return members.map((member) => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    displayName: member.user.displayName,
    email: canSeeEmails ? member.user.email : null,
  }));
}

export async function addMember(userId: string, listId: string, input: { email: string }) {
  await requireOwner(userId, listId);

  const email = input.email.toLowerCase();
  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!target) {
    throw new ApiError("Пользователь не найден", 404, "USER_NOT_FOUND");
  }

  const existing = await prisma.todoListMember.findUnique({
    where: { listId_userId: { listId, userId: target.id } },
  });
  if (existing) {
    throw new ApiError("Пользователь уже участник списка", 409, "ALREADY_MEMBER");
  }

  return prisma.todoListMember.create({
    data: { listId, userId: target.id, role: "EDITOR" },
  });
}

async function requireTargetMembership(listId: string, targetUserId: string) {
  const membership = await prisma.todoListMember.findUnique({
    where: { listId_userId: { listId, userId: targetUserId } },
  });
  if (!membership) {
    throw new ApiError("Участник не найден", 404, "MEMBER_NOT_FOUND");
  }
  return membership;
}

export async function removeMember(
  userId: string,
  listId: string,
  targetUserId: string,
): Promise<void> {
  await requireOwner(userId, listId);

  const target = await requireTargetMembership(listId, targetUserId);
  if (target.role === "OWNER") {
    throw new ApiError("Нельзя удалить владельца списка", 400, "CANNOT_REMOVE_OWNER");
  }

  await prisma.todoListMember.delete({ where: { id: target.id } });
}

export async function changeMemberRole(
  userId: string,
  listId: string,
  targetUserId: string,
  role: MemberRole,
) {
  await requireOwner(userId, listId);

  const target = await requireTargetMembership(listId, targetUserId);
  if (target.role === "OWNER") {
    throw new ApiError("Нельзя изменить роль владельца", 400, "CANNOT_CHANGE_OWNER");
  }
  if (role === "OWNER") {
    throw new ApiError("Нельзя назначить второго владельца", 400, "OWNER_EXISTS");
  }

  return prisma.todoListMember.update({ where: { id: target.id }, data: { role } });
}

export type ListMember = Awaited<ReturnType<typeof listMembers>>[number];