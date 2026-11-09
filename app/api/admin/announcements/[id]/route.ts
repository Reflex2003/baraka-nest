import { del } from "@vercel/blob";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

type RouteContext = { params: Promise<{ id: string }> };

async function isAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user && await isSuperAdminUserId(session.user.id) ? session.user : null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    if (!(await isAdmin(request))) return Response.json({ error: "Not found." }, { status: 404 });
    const { id } = await params;
    const body = await request.json() as { title?: unknown; body?: unknown; publish?: unknown };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.body === "string" ? body.body.trim() : "";
    if (!id || id.length > 100 || title.length > 120 || message.length > 5000 || (!title && !message)) {
      return Response.json({ error: "Add a short title or message before saving." }, { status: 400 });
    }
    await ensureFeatureTables();
    const result = await roommateDb.prepare(`
      UPDATE announcement SET title = ?, body = ?, is_published = CASE WHEN ? THEN 1 ELSE is_published END, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(title || "Baraka Nest update", message, body.publish === true ? 1 : 0, id);
    if (Number(result.rowsAffected ?? 0) !== 1) return Response.json({ error: "Announcement not found." }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin announcement update error:", error);
    return Response.json({ error: "The announcement could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    if (!(await isAdmin(request))) return Response.json({ error: "Not found." }, { status: 404 });
    const { id } = await params;
    if (!id || id.length > 100) return Response.json({ error: "Choose a valid announcement." }, { status: 400 });
    await ensureFeatureTables();
    const assets = await roommateDb.prepare("SELECT blob_path FROM announcement_attachment WHERE announcement_id = ?").all(id) as { blob_path: string }[];
    await roommateDb.prepare("DELETE FROM announcement_attachment WHERE announcement_id = ?").run(id);
    const deleted = await roommateDb.prepare("DELETE FROM announcement WHERE id = ?").run(id);
    if (Number(deleted.rowsAffected ?? 0) !== 1) return Response.json({ error: "Announcement not found." }, { status: 404 });
    await Promise.allSettled(assets.map((asset) => del(asset.blob_path)));
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin announcement deletion error:", error);
    return Response.json({ error: "The announcement could not be deleted." }, { status: 500 });
  }
}
