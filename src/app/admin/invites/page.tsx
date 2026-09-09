import { requireAuth } from "@/lib/auth";
import { listInvitationCodes } from "@/server/admin/service";
import { InviteCodesManager } from "@/components/admin/invite-codes";

export default async function AdminInvitesPage() {
  const user = await requireAuth();
  const codes = await listInvitationCodes(user.id);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Коды приглашений</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Коды позволяют новым пользователям регистрироваться. Создавайте, отключайте и удаляйте коды здесь.
      </p>

      <div className="mt-6">
        <InviteCodesManager codes={codes} />
      </div>
    </div>
  );
}