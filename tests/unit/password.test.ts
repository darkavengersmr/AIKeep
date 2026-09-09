import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password hashing", () => {
  it("hashes a password", async () => {
    const hashed = await hashPassword("correct horse battery staple");
    expect(hashed).not.toContain("correct horse battery staple");
  });

  it("verifies a correct password", async () => {
    const hashed = await hashPassword("s3cret");
    expect(await verifyPassword(hashed, "s3cret")).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hashed = await hashPassword("s3cret");
    expect(await verifyPassword(hashed, "wrong")).toBe(false);
  });

  it("produces unique hashes per call (salt)", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});