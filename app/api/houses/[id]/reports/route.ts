import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

const categories = ["scam_payment", "fake_listing", "wrong_information", "unavailable", "suspicious_media", "misleading", "other"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return Response.json({ error: "Sign in to report this listing." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > 3000) return Response.json({ error: "Report is too large." }, { status: 413 });
  try {
    const { id: houseId } = await params;
    const body = await request.json() as Record<string, unknown>;
    const category = typeof body.category === "string" ? body.category : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    if (!categories.includes(category) || details.length > 1200) return Response.json({ error: "Choose a reason and keep details under 1,200 characters." }, { status: 400 });
    await ensureFeatureTables();
    const house = await roommateDb.prepare("SELECT owner_user_id FROM house_listing WHERE id = ? LIMIT 1").get(houseId) as { owner_user_id: string | null } | undefined;
    if (!house) return Response.json({ error: "Listing not found." }, { status: 404 });
    if (house.owner_user_id === session.user.id) return Response.json({ error: "You cannot report your own listing." }, { status: 400 });
    const duplicate = await roommateDb.prepare("SELECT id FROM house_listing_report WHERE house_id = ? AND reporter_user_id = ? AND status = 'open' LIMIT 1").get(houseId, session.user.id);
    if (duplicate) return Response.json({ error: "You already have an open report for this listing." }, { status: 409 });
    await roommateDb.prepare("INSERT INTO house_listing_report (id, house_id, reporter_user_id, category, details) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), houseId, session.user.id, category, details);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("House listing report error:", error);
    return Response.json({ error: "Your report could not be sent right now." }, { status: 500 });
  }
}
