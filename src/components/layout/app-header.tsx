import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppHeader({ user }: { user: { displayName: string; role: string } }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-header px-4 py-3 sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand shadow-sm">
          <span className="h-3 w-3 rounded-sm bg-foreground/80" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold text-foreground">AIKeep</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
          Главная
        </Link>
        <Link
          href="/?tab=notes"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Заметки
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href="/admin/invites"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Коды приглашений
          </Link>
        )}
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-medium text-foreground">
          {user.displayName}
        </span>
        <ThemeToggle />
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-hover-bg hover:text-foreground"
          >
            Выйти
          </button>
        </form>
      </nav>
    </header>
  );
}