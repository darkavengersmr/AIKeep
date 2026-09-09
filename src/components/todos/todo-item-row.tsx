"use client";

import { useState, useActionState, useTransition } from "react";
import type { TodoItem } from "@prisma/client";
import { updateItemAction, deleteItemAction } from "@/actions/todos";
import { toggleItemAction } from "@/actions/todos";
import { useFormToast } from "@/components/ui/toast";

export function TodoItemRow({
  item,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  readonly = false,
}: {
  item: TodoItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  readonly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateFormAction, updatePending] = useActionState(updateItemAction, undefined);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteItemAction, undefined);
  const [transitionPending, startTransition] = useTransition();
  useFormToast(updateState);
  useFormToast(deleteState);

  const handleToggle = () => {
    startTransition(async () => {
      await toggleItemAction(item.id);
    });
  };

  if (editing) {
    return (
      <li className="rounded border border-line bg-surface p-3 shadow-card">
        <form action={updateFormAction} className="space-y-2">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="text"
            type="text"
            defaultValue={item.text}
            className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          {updateState?.fieldErrors?.text && (
            <p className="text-sm text-danger">{updateState.fieldErrors.text.join(", ")}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={updatePending}
              className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle"
            >
              {updatePending ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-line-strong bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
            >
              Отмена
            </button>
            {updateState?.error && <p className="text-sm text-danger">{updateState.error}</p>}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`rounded border p-3 shadow-card transition-colors ${
        item.isDone ? "border-divider bg-hover-bg" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.isDone}
          onChange={handleToggle}
          disabled={transitionPending || readonly}
          aria-label="Отметить выполненной"
          className="h-4 w-4 shrink-0 cursor-pointer accent-brand"
        />
        <span
          className={`flex-1 break-words text-sm ${
            item.isDone ? "text-subtle line-through" : "text-todo-text"
          }`}
        >
          {item.text}
        </span>
        {!readonly && (
          <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Выше"
            className="rounded border border-line-strong px-2 py-1 text-xs text-muted transition-colors hover:bg-hover-bg hover:text-foreground disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Ниже"
            className="rounded border border-line-strong px-2 py-1 text-xs text-muted transition-colors hover:bg-hover-bg hover:text-foreground disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded border border-line-strong px-2 py-1 text-xs text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
          >
            Изменить
          </button>
          <form action={deleteFormAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={deletePending}
              onClick={(event) => {
                if (!window.confirm("Удалить задачу?")) {
                  event.preventDefault();
                }
              }}
              className="rounded border border-danger/30 px-2 py-1 text-xs text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
            >
              Удалить
            </button>
          </form>
          </div>
        )}
      </div>
      {deleteState?.error && <p className="mt-2 text-sm text-danger">{deleteState.error}</p>}
    </li>
  );
}