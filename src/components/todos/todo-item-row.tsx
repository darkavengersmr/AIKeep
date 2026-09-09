"use client";

import { useState, useActionState, useTransition } from "react";
import type { TodoItem } from "@prisma/client";
import { updateItemAction, deleteItemAction } from "@/actions/todos";
import { toggleItemAction } from "@/actions/todos";

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

  const handleToggle = () => {
    startTransition(async () => {
      await toggleItemAction(item.id);
    });
  };

  if (editing) {
    return (
      <li className="rounded border border-zinc-300 bg-white p-3 shadow-sm">
        <form action={updateFormAction} className="space-y-2">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="text"
            type="text"
            defaultValue={item.text}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          {updateState?.fieldErrors?.text && (
            <p className="text-sm text-red-600">{updateState.fieldErrors.text.join(", ")}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={updatePending}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {updatePending ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
            >
              Отмена
            </button>
            {updateState?.error && <p className="text-sm text-red-600">{updateState.error}</p>}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`rounded border p-3 shadow-sm ${
        item.isDone ? "border-zinc-200 bg-zinc-50" : "border-zinc-300 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.isDone}
          onChange={handleToggle}
          disabled={transitionPending || readonly}
          className="h-4 w-4 shrink-0"
          aria-label="Отметить выполненной"
        />
        <span
          className={`flex-1 break-words text-sm ${
            item.isDone ? "text-zinc-400 line-through" : "text-zinc-800"
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
            className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Ниже"
            className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded border border-zinc-300 px-2 py-1 text-xs"
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
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Удалить
            </button>
          </form>
          </div>
        )}
      </div>
      {deleteState?.error && <p className="mt-2 text-sm text-red-600">{deleteState.error}</p>}
    </li>
  );
}