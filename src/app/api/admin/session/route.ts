import { isAdminAuthenticated } from "@/lib/admin";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return Response.json({ authenticated });
}
