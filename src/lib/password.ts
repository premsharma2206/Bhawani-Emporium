import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const MYSQL_ESCAPES: Record<string, string> = {
  "\0": "\\0",
  "\n": "\\n",
  "\r": "\\r",
  "\\": "\\\\",
  "'": "\\'",
  '"': '\\"',
  "\x1a": "\\Z",
};

/**
 * Hash as the old PHP site computed it: MD5 of the password after
 * mysqli_real_escape_string, so passwords containing quotes still match.
 */
export function legacyMd5(password: string): string {
  const escaped = password.replace(/[\0\n\r\\'"\x1a]/g, (c) => MYSQL_ESCAPES[c]);
  return createHash("md5").update(escaped, "utf8").digest("hex");
}

export type PasswordCheck = { ok: boolean; needsUpgrade: boolean };

/** Checks a password against the bcrypt hash, falling back to an imported MD5 hash. */
export async function verifyPassword(
  user: { passwordHash: string | null; legacyMd5: string | null },
  password: string,
): Promise<PasswordCheck> {
  if (user.passwordHash) {
    return { ok: await bcrypt.compare(password, user.passwordHash), needsUpgrade: false };
  }
  if (user.legacyMd5) {
    const expected = Buffer.from(user.legacyMd5.toLowerCase());
    const actual = Buffer.from(legacyMd5(password));
    const ok = expected.length === actual.length && timingSafeEqual(expected, actual);
    return { ok, needsUpgrade: ok };
  }
  return { ok: false, needsUpgrade: false };
}
