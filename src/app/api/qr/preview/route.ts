import { isAdminAuthenticated, unauthorized } from "@/lib/admin";
import QRCode from "qrcode";

/**
 * Admin-only live preview: renders an arbitrary string (typically JSON) to a PNG
 * data URL WITHOUT saving it. Saving happens through PUT /api/qr.
 */
export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const body = await req.json().catch(() => null);
  const data = typeof body?.data === "string" ? body.data : "";
  if (!data.trim()) {
    return Response.json({ error: "Nothing to encode — the text is empty." }, { status: 400 });
  }
  try {
    JSON.parse(data);
  } catch (e) {
    return Response.json(
      { error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` },
      { status: 400 }
    );
  }
  try {
    const png = await QRCode.toDataURL(data, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    return Response.json({ png });
  } catch (e) {
    return Response.json(
      { error: `Failed to generate QR: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 400 }
    );
  }
}
