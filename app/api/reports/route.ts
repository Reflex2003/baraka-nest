import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to report a profile." }, { status: 401 });
    if (Number(request.headers.get("content-length") ?? 0) > 3000) return Response.json({ error: "Report is too large." }, { status: 413 });
    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return Response.json({ error: "Invalid report." }, { status: 400 });
    }
    const profileId = typeof body.profileId === "string" ? body.profileId.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const categories = ["spam", "unsafe", "fake", "harassment", "other"];
    if (!profileId || profileId.length > 100 ||
      !categories.includes(category) || details.length > 1200) {
      return Response.json({ error: "Choose a reason and add up to 1,200 characters of detail." }, { status: 400 });
    }
    await ensureFeatureTables();
    const profile = await roommateDb.prepare(
      "SELECT user_id FROM roommate_profile WHERE id = ? LIMIT 1",
    ).get(profileId) as { user_id: string } | undefined;
    if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });
    const reportedUserId = profile.user_id;
    if (reportedUserId === session.user.id) return Response.json({ error: "You cannot report your own profile." }, { status: 400 });
    const existing = await roommateDb.prepare(
      "SELECT id FROM moderation_report WHERE reporter_user_id = ? AND reported_user_id = ? AND status = 'open' LIMIT 1",
    ).get(session.user.id, reportedUserId);
    if (existing) return Response.json({ error: "You already have an open report for this profile." }, { status: 409 });
    await roommateDb.prepare(`
      INSERT INTO moderation_report (id, reporter_user_id, reported_user_id, category, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), session.user.id, reportedUserId, category, details);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Profile report error:", error);
    return Response.json({ error: "Your report could not be sent right now." }, { status: 500 });
  }
}
