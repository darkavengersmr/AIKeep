import Link from "next/link";
import type { ListSummary } from "@/server/todos/service";

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

export function ListsSection({ lists }: { lists: ListSummary[] }) {
  if (lists.length === 0) {
    return (
      <p className="text-zinc-500">
        Пока нет списков. Создайте первый список выше.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <li key={list.id}>
          <Link
            href={`/lists/${list.id}`}
            className="block rounded-lg border border-zinc-300 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{list.title}</h3>
              {list.memberCount > 1 && (
                <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Совместный
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {list.itemCount === 0
                ? "Нет задач"
                : list.itemCount === 1
                  ? "1 задача"
                  : `${list.itemCount} задач`}
              {list.memberCount > 1 && ` · ${list.memberCount} участника`}
            </p>
            {list.role !== "OWNER" && (
              <p className="mt-1 text-xs text-zinc-400">{roleLabel(list.role)}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}