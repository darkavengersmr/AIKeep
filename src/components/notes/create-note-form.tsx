"use client";

import { useActionState } from "react";
import { createNoteAction } from "@/actions/notes";
import { NoteColorPicker } from "./color-picker";
import { useFormToast } from "@/components/ui/toast";

export function CreateNoteForm() {
  const [state, action, pending] = useActionState(createNoteAction, undefined);
  useFormToast(state);

  return (
    <form action={action} className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="space-y-2">
        <input
          name="title"
          type="text"
          placeholder="Заголовок"
          className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        <textarea
          name="content"
          rows={3}
          placeholder="Текст заметки..."
          className="w-full resize-none rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
        {state?.fieldErrors?.title && (
          <p className="text-sm text-danger">{state.fieldErrors.title.join(", ")}</p>
        )}
        {state?.fieldErrors?.content && (
          <p className="text-sm text-danger">{state.fieldErrors.content.join(", ")}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <NoteColorPicker name="color" />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-brand px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle"
          >
            {pending ? "Добавление..." : "Добавить"}
          </button>
        </div>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}