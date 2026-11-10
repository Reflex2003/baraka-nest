import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return Response.json({ error: "Sign in before contacting the lister." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.acknowledged !== true) return Response.json({ error: "Acknowledge the safety reminder before continuing." }, { status: 400 });
    await ensureFeatureTables();
    const { id } = await params;
    const house = await roommateDb.prepare(`
      SELECT h.contact_phone FROM house_listing h
      LEFT JOIN house_control c ON c.house_id = h.id
      WHERE h.id = ? AND COALESCE(c.is_hidden, 0) = 0
        AND COALESCE(h.verification_status, 'unverified') NOT IN ('suspended', 'under_review')
      LIMIT 1
    `).get(id) as { contact_phone: string | null } | undefined;
    if (!house) return Response.json({ error: "Listing not found." }, { status: 404 });
    const phone = (house.contact_phone ?? "").replace(/\D/g, "");
    if (!phone) return Response.json({ href: "/contact" });
    const international = phone.startsWith("0") ? `254${phone.slice(1)}` : phone;
    return Response.json({ href: `https://wa.me/${international}?text=${encodeURIComponent("Hi, I'm asking about this house listing on Baraka Nest.")}` }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("House lister contact lookup failed:", error);
    return Response.json({ error: "Could not open the lister contact right now." }, { status: 500 });
  }
}
