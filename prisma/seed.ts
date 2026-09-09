import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email) {
    console.log("ADMIN_EMAIL not set, skipping admin user.");
    return;
  }

  const password = process.env.ADMIN_PASSWORD ?? "";
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrator";
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { displayName, passwordHash, role: "ADMIN" },
    create: { email, displayName, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin user ready: ${admin.email} (${admin.role})`);
}

async function seedInviteCode() {
  const code = (process.env.INVITE_CODE ?? "").trim();
  if (!code) {
    console.log("INVITE_CODE not set, skipping invite code.");
    return;
  }

  const maxUsesRaw = (process.env.INVITE_MAX_USES ?? "").trim();
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;

  const invite = await prisma.invitationCode.upsert({
    where: { code },
    update: { isActive: true, maxUses },
    create: { code, isActive: true, maxUses },
  });

  console.log(`Invite code ready: ${invite.code} (maxUses: ${maxUses ?? "unlimited"})`);
}

async function main() {
  await seedAdmin();
  await seedInviteCode();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });