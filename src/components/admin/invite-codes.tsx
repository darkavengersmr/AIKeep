"use client";

import { useActionState } from "react";
import type { InvitationCode } from "@prisma/client";
import {
  createInvitationCodeAction,
  toggleInvitationCodeAction,
  deleteInvitationCodeAction,
} from "@/actions/admin";
import { useFormToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";

function formatDate(value: Date | null): string {
  if (!value) return "Без срока";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InviteCodesManager({ codes }: { codes: InvitationCode[] }) {
  return (
    <div className="space-y-6">
      <CreateInviteCodeForm />
      {codes.length === 0 ? (
        <EmptyState
          title="Кодов пока нет"
          description="Создайте первый код приглашения выше."
        />
      ) : (
        <ul className="space-y-2">
          {codes.map((code) => (
            <InviteCodeRow key={code.id} code={code} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateInviteCodeForm() {
  const [state, action, pending] = useActionState(createInvitationCodeAction, undefined);
  useFormToast(state);

  return (
    <form action={action} className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <h2 className="text-base font-semibold text-foreground">Новый код</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="code" className="text-sm font-medium text-foreground">
            Код
          </label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="Сгенерировать автоматически"
            className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          {state?.fieldErrors?.code && (
            <p className="text-sm text-danger">{state.fieldErrors.code.join(", ")}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="maxUses" className="text-sm font-medium text-foreground">
            Лимит использований
          </label>
          <input
            id="maxUses"
            name="maxUses"
            type="number"
            min={1}
            placeholder="Без лимита"
            className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          {state?.fieldErrors?.maxUses && (
            <p className="text-sm text-danger">{state.fieldErrors.maxUses.join(", ")}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="expiresAt" className="text-sm font-medium text-foreground">
            Срок действия
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            className="w-full rounded border border-line-strong bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
          {state?.fieldErrors?.expiresAt && (
            <p className="text-sm text-danger">{state.fieldErrors.expiresAt.join(", ")}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-hover active:bg-brand-pressed disabled:bg-divider disabled:text-subtle"
        >
          {pending ? "Создание..." : "Создать код"}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </div>
    </form>
  );
}

function InviteCodeRow({ code }: { code: InvitationCode }) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleInvitationCodeAction,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteInvitationCodeAction,
    undefined,
  );
  useFormToast(toggleState);
  useFormToast(deleteState);

  const maxUsesLabel =
    code.maxUses === null ? "Без лимита" : `Лимит ${code.maxUses}`;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-hover-bg px-2 py-0.5 font-mono text-sm font-semibold text-foreground">
            {code.code}
          </code>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              code.isActive
                ? "bg-success-bg text-success"
                : "bg-hover-bg text-subtle"
            }`}
          >
            {code.isActive ? "Активен" : "Отключён"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Использовано {code.useCount} из {maxUsesLabel} · {formatDate(code.expiresAt)} · создан{" "}
          {new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" }).format(new Date(code.createdAt))}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <form action={toggleAction}>
          <input type="hidden" name="id" value={code.id} />
          <button
            type="submit"
            disabled={togglePending}
            className="rounded border border-line-strong bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover-bg hover:text-foreground disabled:opacity-50"
          >
            {togglePending ? "..." : code.isActive ? "Отключить" : "Включить"}
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={code.id} />
          <button
            type="submit"
            disabled={deletePending}
            onClick={(event) => {
              if (!window.confirm(`Удалить код ${code.code}?`)) {
                event.preventDefault();
              }
            }}
            className="rounded border border-danger/30 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
          >
            Удалить
          </button>
        </form>
      </div>
      {toggleState?.error && <p className="w-full text-sm text-danger">{toggleState.error}</p>}
      {deleteState?.error && <p className="w-full text-sm text-danger">{deleteState.error}</p>}
    </li>
  );
}