"use client";

import { useActionState } from "react";
import type { ListMember } from "@/server/members/service";
import { addMemberAction, removeMemberAction } from "@/actions/members";
import { useFormToast } from "@/components/ui/toast";

const ROLE_LABELS: Record<ListMember["role"], string> = {
  OWNER: "Владелец",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};

export function MembersPanel({
  listId,
  members,
  canManage,
}: {
  listId: string;
  members: ListMember[];
  canManage: boolean;
}) {
  const [addState, addAction, addPending] = useActionState(addMemberAction, undefined);
  useFormToast(addState);

  return (
    <section className="mt-8" aria-label="Участники списка">
      <h2 className="text-lg font-semibold text-foreground">Участники</h2>
      <div className="mt-3 rounded-lg border border-line bg-surface p-4 shadow-card">
        <ul className="space-y-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} listId={listId} canManage={canManage} />
          ))}
        </ul>

        {canManage && (
          <>
            <form
              action={addAction}
              className="mt-4 flex items-center gap-2 border-t border-divider pt-4"
            >
              <input type="hidden" name="listId" value={listId} />
              <input
                name="email"
                type="email"
                placeholder="Email участника"
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
            {addState?.fieldErrors?.email && (
              <p className="mt-2 text-sm text-danger">{addState.fieldErrors.email.join(", ")}</p>
            )}
            {addState?.error && <p className="mt-2 text-sm text-danger">{addState.error}</p>}
          </>
        )}
      </div>
    </section>
  );
}

function MemberRow({
  member,
  listId,
  canManage,
}: {
  member: ListMember;
  listId: string;
  canManage: boolean;
}) {
  const [removeState, removeAction, removePending] = useActionState(removeMemberAction, undefined);
  const isOwner = member.role === "OWNER";
  useFormToast(removeState);

  return (
    <li className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{member.displayName}</p>
        {member.email && <p className="truncate text-xs text-muted">{member.email}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded bg-hover-bg px-2 py-0.5 text-xs text-muted">
          {ROLE_LABELS[member.role]}
        </span>
        {canManage && !isOwner && (
          <form action={removeAction}>
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="userId" value={member.userId} />
            <button
              type="submit"
              disabled={removePending}
              onClick={(event) => {
                if (!window.confirm(`Удалить участника ${member.displayName}?`)) {
                  event.preventDefault();
                }
              }}
              className="rounded border border-danger/30 px-2 py-1 text-xs text-danger transition-colors hover:bg-danger-bg disabled:opacity-50"
            >
              Удалить
            </button>
          </form>
        )}
      </div>
      {removeState?.error && <p className="text-xs text-danger">{removeState.error}</p>}
    </li>
  );
}