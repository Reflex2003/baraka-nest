import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

async function sessionUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

export async function GET(request: Request) {
  try {
    const user = await sessionUser(request);
    if (!user) return Response.json({ blocked: [] }, { status: 200 });
    await ensureFeatureTables();
    const rows = await roommateDb.prepare(`
      SELECT p.id AS profile_id
      FROM user_block b JOIN roommate_profile p ON p.user_id = b.blocked_user_id
      WHERE b.blocker_user_id = ?
    `).all(user.id) as { profile_id: string }[];
    return Response.json({ blocked: rows.map((row) => row.profile_id) });
  } catch (error) {
    console.error("Blocked profiles load error:", error);
    return Response.json({ error: "Blocked profiles are unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return updateBlock(request, true);
}

export async function DELETE(request: Request) {
  return updateBlock(request, false);
}

async function updateBlock(request: Request, block: boolean) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const user = await sessionUser(request);
    if (!user) return Response.json({ error: "Sign in to manage blocked profiles." }, { status: 401 });
    if (Number(request.headers.get("content-length") ?? 0) > 1000) return Response.json({ error: "Invalid request." }, { status: 413 });
    let body: { profileId?: unknown };
    try { body = await request.json(); } catch {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    const profileId = typeof body.profileId === "string" ? body.profileId.trim() : "";
    if (!profileId || profileId.length > 100) return Response.json({ error: "Choose a valid profile." }, { status: 400 });
    await ensureFeatureTables();
    const profile = await roommateDb.prepare("SELECT user_id FROM roommate_profile WHERE id = ? LIMIT 1").get(profileId) as { user_id: string } | undefined;
    if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });
    if (profile.user_id === user.id) return Response.json({ error: "You cannot block your own profile." }, { status: 400 });
    if (block) {
      await roommateDb.prepare("INSERT OR IGNORE INTO user_block (blocker_user_id, blocked_user_id) VALUES (?, ?)").run(user.id, profile.user_id);
    } else {
      await roommateDb.prepare("DELETE FROM user_block WHERE blocker_user_id = ? AND blocked_user_id = ?").run(user.id, profile.user_id);
    }
    return Response.json({ success: true, blocked: block });
  } catch (error) {
    console.error("Profile block update error:", error);
    return Response.json({ error: "The profile safety setting could not be saved." }, { status: 500 });
  }
}
