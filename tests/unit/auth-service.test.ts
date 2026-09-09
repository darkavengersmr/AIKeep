import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { hashPassword } from "@/server/auth/password";
import { registerUser, loginUser } from "@/server/auth/service";
import { verifySessionToken } from "@/server/auth/session";
import { cleanTables } from "./helpers/db";

beforeEach(async () => {
  await cleanTables();
});

async function seedInvite(code: string, maxUses?: number) {
  await prisma.invitationCode.create({
    data: { code, isActive: true, maxUses: maxUses ?? null },
  });
}

describe("registerUser", () => {
  it("registers a user, consumes the code and creates a session", async () => {
    await seedInvite("JOIN-2026");

    const token = await registerUser({
      displayName: "Alice",
      email: "Alice@Example.com",
      password: "password123",
      code: "JOIN-2026",
    });

    const user = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
    expect(user).not.toBeNull();
    expect(user?.role).toBe("USER");
    expect(user?.passwordHash).not.toBe("password123");

    const invite = await prisma.invitationCode.findUnique({ where: { code: "JOIN-2026" } });
    expect(invite?.useCount).toBe(1);

    const sessionUser = await verifySessionToken(token);
    expect(sessionUser?.id).toBe(user?.id);
  });

  it("rejects an already-taken email (normalized to lowercase)", async () => {
    await seedInvite("JOIN-2026");
    await prisma.user.create({
      data: { email: "alice@example.com", displayName: "First", passwordHash: "x" },
    });

    const err = await registerUser({
      displayName: "Alice",
      email: "ALICE@example.com",
      password: "password123",
      code: "JOIN-2026",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
  });

  it("rejects registration with an invalid code", async () => {
    await seedInvite("JOIN-2026");

    const err = await registerUser({
      displayName: "Alice",
      email: "alice@example.com",
      password: "password123",
      code: "WRONG-CODE",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
  });

  it("does not create a user or consume the code when the code is invalid", async () => {
    await seedInvite("JOIN-2026");

    await registerUser({
      displayName: "Alice",
      email: "alice@example.com",
      password: "password123",
      code: "WRONG-CODE",
    }).catch(() => {});

    expect(await prisma.user.count()).toBe(0);
    const invite = await prisma.invitationCode.findUnique({ where: { code: "JOIN-2026" } });
    expect(invite?.useCount).toBe(0);
  });

  it("rolls back the code consumption when the email is already taken", async () => {
    await seedInvite("JOIN-2026");
    await prisma.user.create({
      data: {
        email: "alice@example.com",
        displayName: "Existing",
        passwordHash: "x",
      },
    });

    const err = await registerUser({
      displayName: "Alice 2",
      email: "alice@example.com",
      password: "password123",
      code: "JOIN-2026",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(await prisma.user.count()).toBe(1);
    const invite = await prisma.invitationCode.findUnique({ where: { code: "JOIN-2026" } });
    expect(invite?.useCount).toBe(0);
  });
});

describe("loginUser", () => {
  it("logs in with correct credentials and creates a session", async () => {
    const passwordHash = await hashPassword("password123");
    await prisma.user.create({
      data: { email: "bob@example.com", displayName: "Bob", passwordHash },
    });

    const token = await loginUser({ email: "BOB@example.com", password: "password123" });
    const user = await verifySessionToken(token);
    expect(user?.email).toBe("bob@example.com");
  });

  it("rejects a wrong password", async () => {
    const passwordHash = await hashPassword("password123");
    await prisma.user.create({
      data: { email: "bob@example.com", displayName: "Bob", passwordHash },
    });

    const err = await loginUser({ email: "bob@example.com", password: "wrong" }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
  });

  it("rejects an unknown email", async () => {
    const err = await loginUser({ email: "nobody@example.com", password: "x" }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
  });
});