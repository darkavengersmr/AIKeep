"use client";

import { useActionState } from "react";
import { createNoteAction } from "@/actions/notes";
import { NoteColorPicker } from "./color-picker";
import { useFormToast } from "@/components/ui/toast";

export function CreateNoteForm() {
  const [state, action, pending] = useActionState(createNoteAction, undefined);
  useFormToast(state);

  return (
    <form action={action} className="rounded-lg border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <input
          name="title"
          type="text"
          placeholder="Заголовок"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        />
        <textarea
          name="content"
          rows={3}
          placeholder="Текст заметки..."
          className="w-full resize-none rounded border border-zinc-300 px-3 py-2 text-sm"
        />
        {state?.fieldErrors?.title && (
          <p className="text-sm text-red-600">{state.fieldErrors.title.join(", ")}</p>
        )}
        {state?.fieldErrors?.content && (
          <p className="text-sm text-red-600">{state.fieldErrors.content.join(", ")}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <NoteColorPicker name="color" />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Добавление..." : "Добавить"}
          </button>
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}