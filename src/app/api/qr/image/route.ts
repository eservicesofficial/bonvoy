import { db } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import QRCode from "qrcode";

/**
 * Renders the SAVED wallet QR payload to a PNG data URL.
 * Generation is 100% local via the open-source `qrcode` library — no external API.
 */
export async function GET() {
  await ensureSeed();
  const qr = await db.qrData.findFirst();
  const data = qr?.data ?? "";
  if (!data) {
    return Response.json({ error: "No QR data saved yet." }, { status: 404 });
  }
  try {
    const png = await QRCode.toDataURL(data, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    return Response.json({ png, updatedAt: qr?.updatedAt ?? null });
  } catch (e) {
    return Response.json(
      { error: `Failed to generate QR: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 400 }
    );
  }
}
