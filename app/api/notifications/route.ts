import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to view notifications." }, { status: 401 });

    await ensureFeatureTables();
    const notifications = await roommateDb.prepare(`
      SELECT id, type, title, body, href, created_at, read_at
      FROM in_app_notification
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(session.user.id);

    return Response.json({ notifications });
  } catch (error) {
    console.error("Notifications load error:", error);
    return Response.json({ error: "Notifications could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to update notifications." }, { status: 401 });

    await ensureFeatureTables();
    await roommateDb.prepare(`
      UPDATE in_app_notification SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND read_at IS NULL
    `).run(session.user.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return Response.json({ error: "Notifications could not be updated." }, { status: 500 });
  }
}
