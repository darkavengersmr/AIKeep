import type { DbClient } from "./session";

export async function consumeInvitationCode(
  code: string,
  client: DbClient,
): Promise<boolean> {
  const normalized = code.trim();
  if (!normalized) return false;

  const now = new Date();
  const result = await client.invitationCode.updateMany({
    where: {
      code: normalized,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [
        {
          OR: [
            { maxUses: null },
            { useCount: { lt: client.invitationCode.fields.maxUses } },
          ],
        },
      ],
    },
    data: { useCount: { increment: 1 } },
  });
  return result.count > 0;
}