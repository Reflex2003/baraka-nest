import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";

export async function GET() {
  try {
    await ensureFeatureTables();
    const rows = await roommateDb.prepare(
      "SELECT house_id, is_hidden, is_featured FROM house_control",
    ).all() as { house_id: string; is_hidden: number; is_featured: number }[];
    return Response.json({
      controls: Object.fromEntries(rows.map((row) => [
        row.house_id,
        { hidden: Boolean(row.is_hidden), featured: Boolean(row.is_featured) },
      ])),
    });
  } catch (error) {
    console.error("Housing controls error:", error);
    return Response.json({ error: "Housing listings are unavailable." }, { status: 500 });
  }
}
