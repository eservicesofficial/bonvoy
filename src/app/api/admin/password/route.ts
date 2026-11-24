import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { isAdminAuthenticated, unauthorized, verifyPassword, hashPassword, createAdminSession } from "@/lib/admin";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  await ensureSeed();
  const body = await req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return Response.json({ error: "All password fields are required." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return Response.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  }
  const admin = await db.adminAuth.findFirst();
  if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
    return Response.json({ error: "Current password is incorrect." }, { status: 401 });
  }
  await db.adminAuth.update({
    where: { id: admin.id },
    data: { passwordHash: hashPassword(newPassword) },
  });
  // Refresh the caller's session so it stays valid, while any other session keeps working
  // until its natural expiry (the old password itself no longer authenticates).
  await createAdminSession();
  return Response.json({ ok: true, message: "Password changed successfully." });
}
