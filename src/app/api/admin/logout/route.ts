import { destroyAdminSession } from "@/lib/admin";

export async function POST() {
  await destroyAdminSession();
  return Response.json({ ok: true });
}
