import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const allowed = Boolean(session?.user && await isSuperAdminUserId(session.user.id));
    return Response.json({ allowed }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ allowed: false }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
