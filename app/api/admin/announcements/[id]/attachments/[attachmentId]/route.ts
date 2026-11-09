import { del } from "@vercel/blob";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

type RouteContext = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || !(await isSuperAdminUserId(session.user.id))) return Response.json({ error: "Not found." }, { status: 404 });
    const { id, attachmentId } = await params;
    await ensureFeatureTables();
    const attachment = await roommateDb.prepare(`
      SELECT blob_path FROM announcement_attachment WHERE id = ? AND announcement_id = ? LIMIT 1
    `).get(attachmentId, id) as { blob_path: string } | undefined;
    if (!attachment) return Response.json({ error: "File not found." }, { status: 404 });
    await roommateDb.prepare("DELETE FROM announcement_attachment WHERE id = ? AND announcement_id = ?").run(attachmentId, id);
    try { await del(attachment.blob_path); } catch (error) { console.error("Announcement file cleanup failed:", error); }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin announcement file removal error:", error);
    return Response.json({ error: "The file could not be removed." }, { status: 500 });
  }
}
