import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "bv_admin_session";
const SESSION_DAYS = 7;

/** scrypt hash — passwords are never stored in plain text. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [alg, salt, hash] = stored.split("$");
    if (alg !== "scrypt" || !salt || !hash) return false;
    const calc = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return calc.length === expected.length && timingSafeEqual(calc, expected);
  } catch {
    return false;
  }
}

export async function createAdminSession(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.adminSession.create({ data: { token, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

/** Returns true when the current request carries a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await db.adminSession.findUnique({ where: { token } });
  return !!session && session.expiresAt.getTime() > Date.now();
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.adminSession.deleteMany({ where: { token } });
  }
  jar.delete(COOKIE_NAME);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
}
