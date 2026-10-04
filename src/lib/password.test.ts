import { describe, expect, it } from "vitest";
import { hashPassword, legacyMd5, verifyPassword } from "@/lib/password";

describe("legacyMd5", () => {
  it("matches PHP md5() for a plain password", () => {
    expect(legacyMd5("password")).toBe("5f4dcc3b5aa765d61d8327deb882cf99");
  });

  it("escapes quotes the way the old site did before hashing", () => {
    // PHP ran mysqli_real_escape_string first, so "it's" was hashed as: it\'s
    expect(legacyMd5("it's")).toBe("df8c6fa71f648115ea03cb499348df07");
  });
});

describe("verifyPassword", () => {
  it("accepts the right bcrypt password and rejects a wrong one", async () => {
    const user = { passwordHash: await hashPassword("correct horse"), legacyMd5: null };
    expect(await verifyPassword(user, "correct horse")).toEqual({ ok: true, needsUpgrade: false });
    expect(await verifyPassword(user, "wrong")).toEqual({ ok: false, needsUpgrade: false });
  });

  it("accepts an imported MD5 password and flags it for upgrade", async () => {
    const user = { passwordHash: null, legacyMd5: "5F4DCC3B5AA765D61D8327DEB882CF99" };
    expect(await verifyPassword(user, "password")).toEqual({ ok: true, needsUpgrade: true });
    expect(await verifyPassword(user, "Password")).toEqual({ ok: false, needsUpgrade: false });
  });

  it("ignores the MD5 hash once a bcrypt hash exists", async () => {
    const user = {
      passwordHash: await hashPassword("new password"),
      legacyMd5: "5f4dcc3b5aa765d61d8327deb882cf99",
    };
    expect((await verifyPassword(user, "password")).ok).toBe(false);
  });

  it("rejects accounts with no password set", async () => {
    expect((await verifyPassword({ passwordHash: null, legacyMd5: null }, "")).ok).toBe(false);
  });
});
