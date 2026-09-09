"use client";

import { useState, useActionState } from "react";
import { noteCardClass } from "@/lib/note-colors";
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
      <form action={updateFormAction} className={`rounded-lg border border-zinc-300 p-4 shadow-sm ${noteCardClass(note.color)}`}>
        <input type="hidden" name="id" value={note.id} />
        <div className="space-y-2">
          <input
            name="title"
            type="text"
            defaultValue={note.title ?? ""}
            placeholder="Заголовок"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            rows={5}
            defaultValue={note.content ?? ""}
            placeholder="Текст заметки..."
            className="w-full resize-none rounded border border-zinc-300 px-3 py-2 text-sm"
          />
          {updateState?.fieldErrors?.title && (
            <p className="text-sm text-red-600">{updateState.fieldErrors.title.join(", ")}</p>
          )}
          {updateState?.fieldErrors?.content && (
            <p className="text-sm text-red-600">{updateState.fieldErrors.content.join(", ")}</p>
          )}
          <div className="flex items-center gap-2">
            <NoteColorPicker name="color" value={note.color} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
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
            </div>
            {updateState?.error && <p className="text-sm text-red-600">{updateState.error}</p>}
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={`rounded-lg border border-zinc-300 p-4 shadow-sm ${noteCardClass(note.color)}`}>
      <h3 className="font-semibold">{note.title?.trim() || "Без названия"}</h3>
      {note.content && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{note.content}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
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
            className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Удалить
          </button>
        </form>
      </div>
      {deleteState?.error && <p className="mt-1 text-sm text-red-600">{deleteState.error}</p>}
    </div>
  );
}