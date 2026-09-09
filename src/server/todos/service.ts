import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { requireEditor, requireOwner } from "@/server/access/access";
import type { TodoListCreateInput } from "../validation/schemas";

export async function listLists(userId: string) {
  const memberships = await prisma.todoListMember.findMany({
    where: { userId },
    include: {
      list: {
        include: { _count: { select: { items: true, members: true } } },
      },
    },
    orderBy: { list: { updatedAt: "desc" } },
  });

  return memberships.map((membership) => ({
    id: membership.list.id,
    title: membership.list.title,
    role: membership.role,
    itemCount: membership.list._count.items,
    memberCount: membership.list._count.members,
    createdAt: membership.list.createdAt,
    updatedAt: membership.list.updatedAt,
  }));
}

export async function getListForUser(userId: string, listId: string) {
  const membership = await prisma.todoListMember.findUnique({
    where: { listId_userId: { listId, userId } },
    include: {
      list: {
        include: { items: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!membership) return null;

  return {
    id: membership.list.id,
    title: membership.list.title,
    role: membership.role,
    createdAt: membership.list.createdAt,
    updatedAt: membership.list.updatedAt,
    items: membership.list.items,
  };
}

export async function createList(userId: string, input: TodoListCreateInput) {
  return prisma.$transaction(async (tx) => {
    const list = await tx.todoList.create({
      data: { title: input.title },
    });
    await tx.todoListMember.create({
      data: { listId: list.id, userId, role: "OWNER" },
    });
    return list;
  });
}

export async function updateList(userId: string, listId: string, input: { title: string }) {
  await requireOwner(userId, listId, "Только владелец может переименовать список");
  return prisma.todoList.update({
    where: { id: listId },
    data: { title: input.title },
  });
}

export async function deleteList(userId: string, listId: string): Promise<void> {
  await requireOwner(userId, listId, "Только владелец может удалить список");
  await prisma.todoList.delete({ where: { id: listId } });
}

export async function addItem(userId: string, listId: string, input: { text: string }) {
  await requireEditor(userId, listId);

  const aggregate = await prisma.todoItem.aggregate({
    where: { listId },
    _max: { position: true },
  });
  const position = (aggregate._max.position ?? -1) + 1;

  return prisma.todoItem.create({
    data: { listId, text: input.text, position },
  });
}

async function requireItemAccess(userId: string, itemId: string) {
  const item = await prisma.todoItem.findUnique({
    where: { id: itemId },
    select: { id: true, listId: true, isDone: true },
  });
  if (!item) {
    throw new ApiError("Задача не найдена", 404, "ITEM_NOT_FOUND");
  }
  await requireEditor(userId, item.listId);
  return item;
}

export async function updateItem(userId: string, itemId: string, input: { text: string }) {
  await requireItemAccess(userId, itemId);
  return prisma.todoItem.update({
    where: { id: itemId },
    data: { text: input.text },
  });
}

export async function toggleItem(userId: string, itemId: string) {
  const item = await requireItemAccess(userId, itemId);
  return prisma.todoItem.update({
    where: { id: itemId },
    data: { isDone: !item.isDone },
  });
}

export async function deleteItem(userId: string, itemId: string) {
  await requireItemAccess(userId, itemId);
  return prisma.todoItem.delete({ where: { id: itemId } });
}

export async function reorderItems(
  userId: string,
  listId: string,
  orderedItemIds: string[],
): Promise<void> {
  await requireEditor(userId, listId);

  const items = await prisma.todoItem.findMany({
    where: { listId },
    select: { id: true },
  });
  const itemIds = new Set(items.map((item) => item.id));

  if (
    orderedItemIds.length !== itemIds.size ||
    new Set(orderedItemIds).size !== itemIds.size ||
    !orderedItemIds.every((id) => itemIds.has(id))
  ) {
    throw new ApiError("Некорректный порядок элементов", 400, "INVALID_ORDER");
  }

  await prisma.$transaction(
    orderedItemIds.map((id, position) =>
      prisma.todoItem.update({ where: { id }, data: { position } }),
    ),
  );
}

export type ListForUser = NonNullable<Awaited<ReturnType<typeof getListForUser>>>;
export type ListSummary = Awaited<ReturnType<typeof listLists>>[number];