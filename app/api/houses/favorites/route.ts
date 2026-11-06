import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import { isSameOriginMutation } from "@/lib/request-security";

async function getUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Sign in to save homes." }, { status: 401 });
    await ensureFeatureTables();
    const rows = await roommateDb.prepare(
      "SELECT house_id FROM house_favorite WHERE user_id = ? ORDER BY created_at DESC",
    ).all(user.id) as { house_id: string }[];
    return Response.json({ favorites: rows.map((row) => row.house_id) });
  } catch (error) {
    console.error("Saved homes load error:", error);
    return Response.json({ error: "Saved homes are unavailable right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return updateFavorite(request, true);
}

export async function DELETE(request: Request) {
  return updateFavorite(request, false);
}

async function updateFavorite(request: Request, save: boolean) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Sign in to save homes." }, { status: 401 });
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > 1000) return Response.json({ error: "Invalid request." }, { status: 413 });
    let body: { houseId?: unknown };
    try { body = await request.json(); } catch {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    const houseId = typeof body.houseId === "string" ? body.houseId.trim() : "";
    if (!houseId || houseId.length > 100) {
      return Response.json({ error: "Choose a valid home listing." }, { status: 400 });
    }
    await ensureFeatureTables();
    if (save) {
      const listing = await roommateDb.prepare(`
        SELECT h.id FROM house_listing h
        LEFT JOIN house_control c ON c.house_id = h.id
        WHERE h.id = ? AND COALESCE(c.is_hidden, 0) = 0 LIMIT 1
      `).get(houseId);
      if (!listing) return Response.json({ error: "Choose a visible home listing." }, { status: 404 });
      await roommateDb.prepare(
        "INSERT OR IGNORE INTO house_favorite (user_id, house_id) VALUES (?, ?)",
      ).run(user.id, houseId);
    } else {
      await roommateDb.prepare(
        "DELETE FROM house_favorite WHERE user_id = ? AND house_id = ?",
      ).run(user.id, houseId);
    }
    return Response.json({ success: true, saved: save });
  } catch (error) {
    console.error("Saved home update error:", error);
    return Response.json({ error: "Your saved homes could not be updated." }, { status: 500 });
  }
}
