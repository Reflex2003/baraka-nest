import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

type SearchFilters = {
  location: string;
  type: string;
  maxPrice: number | null;
  query: string;
};

async function getUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Sign in to view saved searches." }, { status: 401 });

    await ensureFeatureTables();
    const searches = await roommateDb.prepare(`
      SELECT id, label, filters, created_at
      FROM house_saved_search
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(user.id) as { id: string; label: string; filters: string; created_at: string }[];

    return Response.json({
      searches: searches.map((search) => ({
        id: search.id,
        label: search.label,
        filters: JSON.parse(search.filters) as SearchFilters,
        createdAt: search.created_at,
      })),
    });
  } catch (error) {
    console.error("Saved house searches load error:", error);
    return Response.json({ error: "Saved searches could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Sign in to save a search." }, { status: 401 });

    const body = await request.json() as { filters?: Partial<SearchFilters> };
    const filters: SearchFilters = {
      location: typeof body.filters?.location === "string" ? body.filters.location.trim().slice(0, 100) : "All locations",
      type: typeof body.filters?.type === "string" ? body.filters.type.trim().slice(0, 80) : "All types",
      maxPrice: Number.isInteger(body.filters?.maxPrice) && Number(body.filters?.maxPrice) > 0
        ? Number(body.filters?.maxPrice)
        : null,
      query: typeof body.filters?.query === "string" ? body.filters.query.trim().slice(0, 100) : "",
    };

    await ensureFeatureTables();
    const encodedFilters = JSON.stringify(filters);
    const existing = await roommateDb.prepare(`
      SELECT id FROM house_saved_search WHERE user_id = ? AND filters = ? LIMIT 1
    `).get(user.id, encodedFilters) as { id: string } | undefined;

    if (existing) return Response.json({ success: true, id: existing.id, alreadySaved: true });

    const id = randomUUID();
    const label = `${filters.location} · ${filters.type}${filters.maxPrice ? ` · up to KSh ${filters.maxPrice.toLocaleString()}` : ""}`;
    await roommateDb.prepare(`
      INSERT INTO house_saved_search (id, user_id, label, filters)
      VALUES (?, ?, ?, ?)
    `).run(id, user.id, label, encodedFilters);

    return Response.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Saved house search create error:", error);
    return Response.json({ error: "This search could not be saved." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Sign in to remove a saved search." }, { status: 401 });
    const body = await request.json() as { id?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id || id.length > 100) return Response.json({ error: "Choose a valid saved search." }, { status: 400 });

    await ensureFeatureTables();
    await roommateDb.prepare("DELETE FROM house_saved_search WHERE id = ? AND user_id = ?").run(id, user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Saved house search removal error:", error);
    return Response.json({ error: "This saved search could not be removed." }, { status: 500 });
  }
}
