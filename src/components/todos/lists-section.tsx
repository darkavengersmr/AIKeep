import Link from "next/link";
import type { ListSummary } from "@/server/todos/service";
import { EmptyState } from "@/components/ui/empty-state";

function roleLabel(role: ListSummary["role"]): string {
  switch (role) {
    case "OWNER":
      return "Вы — владелец";
    case "EDITOR":
      return "Вы — редактор";
    case "VIEWER":
      return "Вы — наблюдатель";
  }
}

export function ListsSection({
  lists,
  emptyTitle = "Списков пока нет",
  emptyDescription = "Создайте первый список, и он появится здесь.",
}: {
  lists: ListSummary[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (lists.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <li key={list.id}>
          <Link
            href={`/lists/${list.id}`}
            className="block rounded-lg border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{list.title}</h3>
              {list.memberCount > 1 && (
                <span className="shrink-0 rounded bg-info-bg px-2 py-0.5 text-xs font-medium text-info">
                  Совместный
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">
              {list.itemCount === 0
                ? "Нет задач"
                : list.itemCount === 1
                  ? "1 задача"
                  : `${list.itemCount} задач`}
              {list.memberCount > 1 && ` · ${list.memberCount} участника`}
            </p>
            {list.role !== "OWNER" && (
              <p className="mt-1 text-xs text-subtle">{roleLabel(list.role)}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}