import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import type { CreateInvitationCodeInput } from "@/server/validation/schemas";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInvitationCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[randomBytes(1)[0] % CODE_ALPHABET.length];
  }
  return code;
}

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") {
    throw new ApiError("Недостаточно прав", 403, "FORBIDDEN");
  }
  return user;
}

export async function listInvitationCodes(userId: string) {
  await requireAdmin(userId);
  return prisma.invitationCode.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createInvitationCode(userId: string, input: CreateInvitationCodeInput) {
  await requireAdmin(userId);

  const code = input.code?.trim() || generateInvitationCode();
  const existing = await prisma.invitationCode.findUnique({ where: { code } });
  if (existing) {
    throw new ApiError("Код уже существует", 409, "CODE_TAKEN");
  }

  return prisma.invitationCode.create({
    data: {
      code,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ?? null,
      createdById: userId,
    },
  });
}

export async function toggleInvitationCode(userId: string, id: string) {
  await requireAdmin(userId);

  const invite = await prisma.invitationCode.findUnique({ where: { id } });
  if (!invite) {
    throw new ApiError("Код не найден", 404, "CODE_NOT_FOUND");
  }

  return prisma.invitationCode.update({
    where: { id },
    data: { isActive: !invite.isActive },
  });
}

export async function deleteInvitationCode(userId: string, id: string): Promise<void> {
  await requireAdmin(userId);

  const { count } = await prisma.invitationCode.deleteMany({ where: { id } });
  if (count === 0) {
    throw new ApiError("Код не найден", 404, "CODE_NOT_FOUND");
  }
}