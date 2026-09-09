import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand shadow-fab">
        <span className="h-4 w-4 rounded-sm bg-foreground/80" aria-hidden="true" />
      </div>
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}