import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand shadow-fab">
        <span className="h-4 w-4 rounded-sm bg-foreground/80" aria-hidden="true" />
      </div>
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}