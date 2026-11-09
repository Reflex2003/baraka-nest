import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";
import { getAnnouncements } from "@/lib/announcement-data";

async function isAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user && await isSuperAdminUserId(session.user.id) ? session.user : null;
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin(request))) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ announcements: await getAnnouncements() });
  } catch (error) {
    console.error("Admin announcements load error:", error);
    return Response.json({ error: "Announcements could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const admin = await isAdmin(request);
    if (!admin) return Response.json({ error: "Not found." }, { status: 404 });
    const body = await request.json() as { title?: unknown; body?: unknown };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.body === "string" ? body.body.trim() : "";
    if (title.length > 120 || message.length > 5000 || (!title && !message)) {
      return Response.json({ error: "Add a short title or message before publishing." }, { status: 400 });
    }

    await ensureFeatureTables();
    const id = randomUUID();
    await roommateDb.prepare(`
      INSERT INTO announcement (id, title, body, created_by)
      VALUES (?, ?, ?, ?)
    `).run(id, title || "Baraka Nest update", message, admin.id);
    return Response.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Admin announcement create error:", error);
    return Response.json({ error: "The announcement could not be published." }, { status: 500 });
  }
}
