import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { consumeInvitationCode } from "@/server/auth/invitation";
import { cleanTables } from "./helpers/db";

beforeEach(async () => {
  await cleanTables();
});

describe("consumeInvitationCode", () => {
  it("consumes a valid active code", async () => {
    await prisma.invitationCode.create({
      data: { code: "CODE-1", isActive: true },
    });

    const consumed = await consumeInvitationCode("CODE-1", prisma);
    expect(consumed).toBe(true);

    const row = await prisma.invitationCode.findUnique({ where: { code: "CODE-1" } });
    expect(row?.useCount).toBe(1);
  });

  it("returns false for an unknown code", async () => {
    expect(await consumeInvitationCode("NOPE-123", prisma)).toBe(false);
  });

  it("returns false for an inactive code", async () => {
    await prisma.invitationCode.create({
      data: { code: "INACT-1", isActive: false },
    });
    expect(await consumeInvitationCode("INACT-1", prisma)).toBe(false);
  });

  it("returns false for an expired code", async () => {
    await prisma.invitationCode.create({
      data: { code: "EXP-0001", isActive: true, expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await consumeInvitationCode("EXP-0001", prisma)).toBe(false);
  });

  it("consumes a code with future expiry", async () => {
    await prisma.invitationCode.create({
      data: { code: "FUT-0001", isActive: true, expiresAt: new Date(Date.now() + 60_000) },
    });
    expect(await consumeInvitationCode("FUT-0001", prisma)).toBe(true);
  });

  it("enforces maxUses limit", async () => {
    await prisma.invitationCode.create({
      data: { code: "LIMIT-1", isActive: true, maxUses: 2 },
    });

    expect(await consumeInvitationCode("LIMIT-1", prisma)).toBe(true);
    expect(await consumeInvitationCode("LIMIT-1", prisma)).toBe(true);
    expect(await consumeInvitationCode("LIMIT-1", prisma)).toBe(false);

    const row = await prisma.invitationCode.findUnique({ where: { code: "LIMIT-1" } });
    expect(row?.useCount).toBe(2);
  });

  it("allows unlimited uses when maxUses is null", async () => {
    await prisma.invitationCode.create({
      data: { code: "UNLIMIT", isActive: true, maxUses: null },
    });

    for (let i = 0; i < 5; i++) {
      expect(await consumeInvitationCode("UNLIMIT", prisma)).toBe(true);
    }
  });

  it("trims surrounding whitespace on the code", async () => {
    await prisma.invitationCode.create({
      data: { code: "TRIM-01", isActive: true },
    });
    expect(await consumeInvitationCode("  TRIM-01  ", prisma)).toBe(true);
  });

  it("consumes a limited code exactly once under a race", async () => {
    await prisma.invitationCode.create({
      data: { code: "RACE-01", isActive: true, maxUses: 1 },
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => consumeInvitationCode("RACE-01", prisma)),
    );

    expect(results.filter(Boolean)).toHaveLength(1);
    const row = await prisma.invitationCode.findUnique({ where: { code: "RACE-01" } });
    expect(row?.useCount).toBe(1);
  });
});