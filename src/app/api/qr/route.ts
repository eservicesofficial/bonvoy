import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { isAdminAuthenticated, unauthorized } from "@/lib/admin";

/** Returns the saved QR payload (the exact JSON string that is encoded into the QR). */
export async function GET() {
  await ensureSeed();
  const qr = await db.qrData.findFirst();
  return Response.json({ data: qr?.data ?? "", updatedAt: qr?.updatedAt ?? null });
}

/** Admin-only: save the exact JSON string after validating it parses as JSON. */
export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  await ensureSeed();
  const body = await req.json().catch(() => null);
  const data = typeof body?.data === "string" ? body.data : null;
  if (data === null) {
    return Response.json({ error: "Missing QR data string." }, { status: 400 });
  }
  try {
    JSON.parse(data);
  } catch (e) {
    return Response.json(
      { error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` },
      { status: 400 }
    );
  }
  const existing = await db.qrData.findFirst();
  const saved = existing
    ? await db.qrData.update({ where: { id: existing.id }, data: { data } })
    : await db.qrData.create({ data: { id: "singleton", data } });
  return Response.json({ ok: true, data: saved.data, updatedAt: saved.updatedAt });
}
