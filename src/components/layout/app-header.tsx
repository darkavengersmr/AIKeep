import Link from "next/link";
import { logoutAction } from "@/actions/auth";

export function AppHeader({ user }: { user: { displayName: string; role: string } }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-semibold">
        AIKeep
      </Link>
      <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Link href="/" className="text-sm text-zinc-600 hover:underline">
          Главная
        </Link>
        <Link href="/?tab=notes" className="text-sm text-zinc-600 hover:underline">
          Заметки
        </Link>
        {user.role === "ADMIN" && (
          <Link href="/admin/invites" className="text-sm text-zinc-600 hover:underline">
            Коды приглашений
          </Link>
        )}
        <span className="text-sm text-zinc-600">{user.displayName}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Выйти
          </button>
        </form>
      </nav>
    </header>
  );
}