import { db } from "@/lib/db";
import { hashPassword } from "@/lib/admin";

/**
 * Initial admin password — used for first-time setup only.
 * It is stored as a scrypt hash and is NOT reset automatically on restart.
 * Once the admin changes the password, this constant is no longer relevant.
 */
const INITIAL_ADMIN_PASSWORD = "741504";

/** Exact example JSON payload the admin can replace later in the dashboard. */
const INITIAL_QR_JSON = `{
"accountId": "087584268",
"acctStat": "Active",
"dateDTM": "2026-11-22T12:57:18.692Z",
"eliteLvl": "Member",
"encryptedPayLoad": "n/a",
"expireDateTime": "2026-11-25T12:57:18.7425565Z",
"frstn": "SARBJEET",
"lstn": "RATHOUR",
"lvlTypeId": "MRD",
"refId": "t97zVeXhw3rE4Y4STV7MeiSUcqoAAAAAvwYkmblk03y9faUdi+l278kyfY4/8AGJ"
}`;

let seeded = false;

/** Idempotently create the singletons (profile / admin hash / QR data) if missing. */
export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  await db.profile.findFirst().then(async (p) => {
    if (!p) await db.profile.create({ data: { id: "singleton" } });
  });
  const admin = await db.adminAuth.findFirst();
  if (!admin) {
    await db.adminAuth.create({
      data: { id: "singleton", passwordHash: hashPassword(INITIAL_ADMIN_PASSWORD) },
    });
  }
  await db.qrData.findFirst().then(async (q) => {
    if (!q) await db.qrData.create({ data: { id: "singleton", data: INITIAL_QR_JSON } });
  });
  seeded = true;
}

/** Re-arm seeding (used after DB resets in dev). */
export function resetSeedFlag() {
  seeded = false;
}
