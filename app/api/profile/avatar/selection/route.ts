import { auth } from "@/lib/better-auth";
import { del } from "@vercel/blob";
import { ensureFeatureTables } from "@/lib/db";
import { getProfileAvatar } from "@/lib/profile-avatars";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

export async function PATCH(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to choose a profile avatar." }, { status: 401 });

    const body = await request.json() as { avatarId?: unknown };
    const avatar = typeof body.avatarId === "string" ? getProfileAvatar(body.avatarId) : null;
    if (!avatar) return Response.json({ error: "Choose an available avatar." }, { status: 400 });

    await ensureFeatureTables();
    const current = await roommateDb.prepare('SELECT image FROM "user" WHERE id = ? LIMIT 1').get(session.user.id) as { image: string | null } | undefined;
    await roommateDb.prepare('UPDATE "user" SET image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(avatar.src, session.user.id);
    if (current?.image?.includes(".public.blob.vercel-storage.com/")) {
      try { await del(current.image); } catch (error) { console.error("Previous avatar cleanup failed:", error); }
    }
    return Response.json({ success: true, avatarUrl: avatar.src, avatarId: avatar.id });
  } catch (error) {
    console.error("Profile avatar selection error:", error);
    return Response.json({ error: "The profile avatar could not be saved." }, { status: 500 });
  }
}
