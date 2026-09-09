import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Добро пожаловать, {user.displayName}!</h1>
      <p className="mt-2 text-zinc-600">
        Здесь появятся ваши заметки и списки дел.
      </p>
    </div>
  );
}