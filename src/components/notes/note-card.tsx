"use client";

import { useState, useActionState } from "react";
import { noteCardClass, noteCardHoverClass } from "@/lib/note-colors";
import type { NoteFormState } from "@/actions/notes";
import { NoteColorPicker } from "./color-picker";
import { useFormToast } from "@/components/ui/toast";

type NoteData = {
  id: string;
  title: string | null;
  content: string | null;
  color: string | null;
};

type NoteAction = (prevState: NoteFormState, formData: FormData) => Promise<NoteFormState>;

export function NoteCard({
  note,
  updateAction,
  deleteAction,
}: {
  note: NoteData;
  updateAction: NoteAction;
  deleteAction: NoteAction;
}) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateFormAction, updatePending] = useActionState(updateAction, undefined);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteAction, undefined);
  useFormToast(updateState);
  useFormToast(deleteState);

  if (editing) {
    return (
      <form
        action={updateFormAction}
        className={`rounded-lg border border-line p-4 shadow-card ${noteCardClass(note.color)}`}
      >
        <input type="hidden" name="id" value={note.id} />
        <div className="space-y-2">
          <input
            name="title"
            type="text"
            defaultValue={note.title ?? ""}
            placeholder="Заголовок"
            className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          <textarea
            name="content"
            rows={5}
            defaultValue={note.content ?? ""}
            placeholder="Текст заметки..."
            className="w-full resize-none rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          {updateState?.fieldErrors?.title && (
            <p className="text-sm text-danger">{updateState.fieldErrors.title.join(", ")}</p>
          )}
          {updateState?.fieldErrors?.content && (
            <p className="text-sm text-danger">{updateState.fieldErrors.content.join(", ")}</p>
          )}
          <div className="flex items-center gap-2">
            <NoteColorPicker name="color" value={note.color} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
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
            </div>
            {updateState?.error && <p className="text-sm text-danger">{updateState.error}</p>}
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`rounded-lg border border-line p-4 shadow-card transition-colors ${noteCardClass(note.color)} ${noteCardHoverClass(note.color)}`}
    >
      <h3 className="font-semibold text-foreground">{note.title?.trim() || "Без названия"}</h3>
      {note.content && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{note.content}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded border border-line-strong bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
        >
          Изменить
        </button>
        <form action={deleteFormAction}>
          <input type="hidden" name="id" value={note.id} />
          <button
            type="submit"
            disabled={deletePending}
            onClick={(event) => {
              if (!window.confirm("Удалить заметку?")) {
                event.preventDefault();
              }
            }}
            className="rounded border border-danger/30 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
          >
            Удалить
          </button>
        </form>
      </div>
      {deleteState?.error && <p className="mt-1 text-sm text-danger">{deleteState.error}</p>}
    </div>
  );
}