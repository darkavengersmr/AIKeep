import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function MainLayout({ children }: LayoutProps<"/">) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Link href="/" className="text-lg font-semibold">
          AIKeep
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">{user.displayName}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              Выйти
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}