import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { verifyPassword, createAdminSession } from "@/lib/admin";

export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) {
    return Response.json({ error: "Password is required." }, { status: 400 });
  }
  const admin = await db.adminAuth.findFirst();
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return Response.json({ error: "Incorrect password. Please try again." }, { status: 401 });
  }
  await createAdminSession();
  return Response.json({ ok: true });
}
