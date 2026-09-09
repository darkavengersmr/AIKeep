"use client";

import { useActionState } from "react";
import { createListAction } from "@/actions/todos";
import { useFormToast } from "@/components/ui/toast";

export function CreateListForm() {
  const [state, action, pending] = useActionState(createListAction, undefined);
  useFormToast(state);

  return (
    <form action={action} className="rounded-lg border border-zinc-300 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <input
          name="title"
          type="text"
          placeholder="Название списка"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
        />
        {state?.fieldErrors?.title && (
          <p className="text-sm text-red-600">{state.fieldErrors.title.join(", ")}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Создание..." : "Создать список"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}