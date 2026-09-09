import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  generateSessionToken,
  hashSessionToken,
  verifySessionToken,
} from "@/server/auth/session";
import { cleanTables, createUser } from "./helpers/db";

beforeEach(async () => {
  await cleanTables();
});

describe("session tokens", () => {
  it("generates a unique base64url token of 32 bytes", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashes a token with sha256", () => {
    const token = generateSessionToken();
    const hash = hashSessionToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionToken(token)).toBe(hash);
  });
});

describe("session lifecycle", () => {
  it("creates a session and stores only the hash", async () => {
    const user = await createUser();
    const token = await createSession(user.id);

    const stored = await prisma.session.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].tokenHash).toBe(hashSessionToken(token));
    expect(stored[0].tokenHash).not.toBe(token);
  });

  it("verifies a valid token and returns the user", async () => {
    const user = await createUser();
    const token = await createSession(user.id);

    const verified = await verifySessionToken(token);
    expect(verified?.id).toBe(user.id);
    expect(verified?.email).toBe(user.email);
  });

  it("returns null for an unknown token", async () => {
    expect(await verifySessionToken(generateSessionToken())).toBeNull();
  });

  it("destroys a session by token", async () => {
    const user = await createUser();
    const token = await createSession(user.id);
    expect(await verifySessionToken(token)).not.toBeNull();

    await destroySession(token);
    expect(await verifySessionToken(token)).toBeNull();
    expect(await prisma.session.count()).toBe(0);
  });

  it("returns null for an expired session and cleans it up", async () => {
    const user = await createUser();
    const token = await createSession(user.id);

    await prisma.session.updateMany({
      where: { tokenHash: hashSessionToken(token) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    expect(await verifySessionToken(token)).toBeNull();
    expect(await prisma.session.count()).toBe(0);
  });

  it("sliding renewal extends the expiry on use", async () => {
    const user = await createUser();
    const token = await createSession(user.id);

    await prisma.session.updateMany({
      where: { tokenHash: hashSessionToken(token) },
      data: { expiresAt: new Date(Date.now() + 60_000) },
    });

    await verifySessionToken(token);
    const after = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
    });
    expect(after?.expiresAt.getTime()).toBeGreaterThan(Date.now() + 60_000);
  });
});