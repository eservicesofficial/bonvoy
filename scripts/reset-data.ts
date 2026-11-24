/**
 * Restore delivery-state data (run with: bun /home/z/my-project/scripts/reset-data.ts):
 *  - Admin password back to the initial 741504 (scrypt-hashed).
 *  - Profile back to the seeded defaults (Angel Priya, 323 nights, ...).
 *  - Wallet QR JSON back to the original SARBJEET/RATHOUR payload.
 *  - All admin sessions cleared.
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const db = new PrismaClient();

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

const INITIAL_ADMIN_PASSWORD = "741504";

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

const PROFILE_DEFAULTS = {
  firstName: "Angel",
  lastName: "Priya",
  memberNumber: "060575526",
  memberLevel: "Titanium Elite",
  nights: 323,
  lifetimeNights: 3,
  spend: 12339,
  points: 2212,
  expiryDate: "Nov 22, 2028",
  memberSince: "2026",
};

async function main() {
  await db.adminAuth.update({
    where: { id: "singleton" },
    data: { passwordHash: hashPassword(INITIAL_ADMIN_PASSWORD) },
  });
  await db.adminSession.deleteMany({});
  await db.profile.update({ where: { id: "singleton" }, data: PROFILE_DEFAULTS });
  await db.qrData.update({ where: { id: "singleton" }, data: { data: INITIAL_QR_JSON } });
  const p = await db.profile.findUnique({ where: { id: "singleton" } });
  console.log("reset done — profile:", p?.firstName, p?.lastName, "nights:", p?.nights);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
