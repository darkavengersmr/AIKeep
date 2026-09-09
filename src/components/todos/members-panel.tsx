"use client";

import { useActionState } from "react";
import type { ListMember } from "@/server/members/service";
import { addMemberAction, removeMemberAction } from "@/actions/members";

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

  return (
    <section className="mt-8" aria-label="Участники списка">
      <h2 className="text-lg font-semibold">Участники</h2>
      <div className="mt-3 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm">
        <ul className="space-y-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} listId={listId} canManage={canManage} />
          ))}
        </ul>

        {canManage && (
          <>
            <form
              action={addAction}
              className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-4"
            >
              <input type="hidden" name="listId" value={listId} />
              <input
                name="email"
                type="email"
                placeholder="Email участника"
                className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={addPending}
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {addPending ? "Добавление..." : "Добавить"}
              </button>
            </form>
            {addState?.fieldErrors?.email && (
              <p className="mt-2 text-sm text-red-600">{addState.fieldErrors.email.join(", ")}</p>
            )}
            {addState?.error && <p className="mt-2 text-sm text-red-600">{addState.error}</p>}
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

  return (
    <li className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{member.displayName}</p>
        {member.email && <p className="truncate text-xs text-zinc-500">{member.email}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
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
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Удалить
            </button>
          </form>
        )}
      </div>
      {removeState?.error && <p className="text-xs text-red-600">{removeState.error}</p>}
    </li>
  );
}