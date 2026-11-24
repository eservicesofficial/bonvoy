import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { isAdminAuthenticated, unauthorized } from "@/lib/admin";
import { MEMBERSHIP_LEVELS, canonicalLevel } from "@/lib/bonvoy/theme";

export async function GET() {
  try {
    await ensureSeed();
    const profile = await db.profile.findFirst();
    if (!profile) {
      return Response.json({ error: "Profile record was not found in the database." }, { status: 500 });
    }
    return Response.json(profile);
  } catch (error) {
    console.error("[api/profile] Failed to load profile:", error);
    return Response.json(
      { error: "Could not load account details. Check the server database configuration." },
      { status: 500 }
    );
  }
}

const MAX_STR = 60;

function clampStr(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const t = v.trim();
  return t.slice(0, MAX_STR) || fallback;
}

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  await ensureSeed();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const current = await db.profile.findFirst();
  if (!current) return Response.json({ error: "Profile missing." }, { status: 500 });

  const data: Record<string, string | number> = {};
  if ("firstName" in body) data.firstName = clampStr(body.firstName, current.firstName) || "Guest";
  if ("lastName" in body) data.lastName = clampStr(body.lastName, current.lastName);
  if ("memberNumber" in body) data.memberNumber = clampStr(body.memberNumber, current.memberNumber);
  if ("memberLevel" in body) {
    // The membership level drives the global theme — only the six canonical
    // levels are accepted (case-insensitive), so name + theme always stay in sync.
    const canon = canonicalLevel(typeof body.memberLevel === "string" ? body.memberLevel : "");
    if (!canon) {
      return Response.json(
        { error: `Membership level must be one of: ${MEMBERSHIP_LEVELS.join(", ")}.` },
        { status: 400 }
      );
    }
    data.memberLevel = canon;
  }
  if ("memberSince" in body) data.memberSince = clampStr(body.memberSince, current.memberSince);
  if ("expiryDate" in body) data.expiryDate = clampStr(body.expiryDate, current.expiryDate);
  if ("nights" in body) data.nights = clampInt(body.nights, 0, 100000, current.nights);
  if ("lifetimeNights" in body) data.lifetimeNights = clampInt(body.lifetimeNights, 0, 100000, current.lifetimeNights);
  if ("points" in body) data.points = clampInt(body.points, 0, 10000000, current.points);
  if ("spend" in body) {
    const n = typeof body.spend === "number" ? body.spend : parseFloat(String(body.spend));
    data.spend = Number.isFinite(n) ? Math.min(10000000, Math.max(0, n)) : current.spend;
  }

  const updated = await db.profile.update({ where: { id: current.id }, data });
  return Response.json(updated);
}
