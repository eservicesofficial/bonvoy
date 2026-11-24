// Reset app data to the delivery state (delivery: password 741504, Angel Priya, 323 nights, original QR JSON).
const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const db = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const ORIGINAL_QR = `{
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

(async () => {
  const profile = await db.profile.findFirst();
  if (profile) {
    await db.profile.update({
      where: { id: profile.id },
      data: {
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
      },
    });
  }
  const admin = await db.adminAuth.findFirst();
  if (admin) {
    await db.adminAuth.update({
      where: { id: admin.id },
      data: { passwordHash: hashPassword("741504") },
    });
  }
  await db.adminSession.deleteMany({});
  const qr = await db.qrData.findFirst();
  if (qr) {
    await db.qrData.update({ where: { id: qr.id }, data: { data: ORIGINAL_QR } });
  }
  console.log("RESET DONE: profile=Angel Priya/323, password=741504 (hash refreshed), sessions cleared, QR=original");
  await db.$disconnect();
})();
