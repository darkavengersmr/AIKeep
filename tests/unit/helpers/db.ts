import { prisma } from "@/lib/prisma";

export async function cleanTables(): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.invitationCode.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(overrides: Partial<{ email: string; displayName: string }> = {}) {
  const email = overrides.email ?? `user-${crypto.randomUUID()}@test.local`;
  return prisma.user.create({
    data: {
      email,
      displayName: overrides.displayName ?? "Test User",
      passwordHash: "not-used-in-tests",
    },
  });
}