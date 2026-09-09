import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} />
      <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}