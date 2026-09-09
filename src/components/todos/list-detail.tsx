"use client";

import { useState, useActionState, useTransition } from "react";
import type { ListForUser } from "@/server/todos/service";
import type { ListMember } from "@/server/members/service";
import {
  addItemAction,
  updateListAction,
  deleteListAction,
} from "@/actions/todos";
import { reorderItemsAction } from "@/actions/todos";
import { TodoItemRow } from "./todo-item-row";
import { MembersPanel } from "./members-panel";
import { useFormToast } from "@/components/ui/toast";

export function ListDetail({
  list,
  members,
}: {
  list: ListForUser;
  members: ListMember[];
}) {
  const isOwner = list.role === "OWNER";
  const canEdit = list.role === "OWNER" || list.role === "EDITOR";
  const [editingTitle, setEditingTitle] = useState(false);
  const [addState, addAction, addPending] = useActionState(addItemAction, undefined);
  const [updateListState, updateListFormAction, updateListPending] = useActionState(
    updateListAction,
    undefined,
  );
  const [deleteListState, deleteListFormAction, deleteListPending] = useActionState(
    deleteListAction,
    undefined,
  );
  const [transitionPending, startTransition] = useTransition();
  useFormToast(addState);
  useFormToast(updateListState);
  useFormToast(deleteListState);

  const sortedItems = [...list.items].sort((a, b) => a.position - b.position);

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedItems.length) return;
    const next = [...sortedItems];
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      await reorderItemsAction(list.id, next.map((item) => item.id));
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        {isOwner && editingTitle ? (
          <form action={updateListFormAction} className="flex flex-1 items-center gap-2">
            <input type="hidden" name="id" value={list.id} />
            <input
              name="title"
              type="text"
              defaultValue={list.title}
              className="flex-1 rounded border border-line-strong bg-surface px-3 py-2 text-lg text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={updateListPending}
              className="rounded bg-brand px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle"
            >
              {updateListPending ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={() => setEditingTitle(false)}
              className="rounded border border-line-strong bg-surface px-3 py-2 text-sm text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
            >
              Отмена
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{list.title}</h1>
            {isOwner && (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="rounded border border-line-strong bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
              >
                Переименовать
              </button>
            )}
          </div>
        )}
        {isOwner && (
          <form action={deleteListFormAction}>
            <input type="hidden" name="id" value={list.id} />
            <button
              type="submit"
              disabled={deleteListPending}
              onClick={(event) => {
                if (!window.confirm("Удалить список? Это удалит все задачи.")) {
                  event.preventDefault();
                }
              }}
              className="rounded border border-danger/30 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
            >
              Удалить список
            </button>
          </form>
        )}
      </div>
      {updateListState?.error && <p className="mt-2 text-sm text-danger">{updateListState.error}</p>}
      {deleteListState?.error && <p className="mt-2 text-sm text-danger">{deleteListState.error}</p>}

      {canEdit && (
        <section className="mt-6" aria-label="Новая задача">
          <form action={addAction} className="flex items-center gap-2">
            <input type="hidden" name="listId" value={list.id} />
            <input
              name="text"
              type="text"
              placeholder="Новая задача..."
              className="flex-1 rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addPending}
              className="rounded bg-brand px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle"
            >
              {addPending ? "Добавление..." : "Добавить"}
            </button>
          </form>
          {addState?.fieldErrors?.text && (
            <p className="mt-2 text-sm text-danger">{addState.fieldErrors.text.join(", ")}</p>
          )}
          {addState?.error && <p className="mt-2 text-sm text-danger">{addState.error}</p>}
        </section>
      )}

      {sortedItems.length === 0 ? (
        <p className="mt-8 text-muted">В списке пока нет задач.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {sortedItems.map((item, index) => (
            <TodoItemRow
              key={item.id}
              item={item}
              readonly={!canEdit}
              canMoveUp={index > 0}
              canMoveDown={index < sortedItems.length - 1}
              onMoveUp={() => moveItem(index, -1)}
              onMoveDown={() => moveItem(index, 1)}
            />
          ))}
        </ul>
      )}
      {transitionPending && <p className="mt-4 text-sm text-muted">Сохранение порядка...</p>}

      <MembersPanel listId={list.id} members={members} canManage={isOwner} />
    </div>
  );
}