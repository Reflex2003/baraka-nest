import { NextResponse } from "next/server";
import { ensureFeatureTables, query } from "@/lib/db";

type HouseImageRow = {
  id: string;
  house_id: string;
  url: string;
  blob_path: string;
  sort_order: number;
  is_cover: number;
  created_at: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureFeatureTables();

    const { id } = await params;

    if (!id || id.length > 200) {
      return NextResponse.json(
        { error: "Invalid house id." },
        { status: 400 },
      );
    }

    const result = await query<HouseImageRow>(
      `
        SELECT
          id,
          house_id,
          url,
          blob_path,
          sort_order,
          is_cover,
          created_at
        FROM house_image
        WHERE house_id = ?
        ORDER BY is_cover DESC, sort_order ASC, created_at ASC
      `,
      [id],
    );

    return NextResponse.json(
      {
        images: result.rows.map((row) => ({
          id: row.id,
          houseId: row.house_id,
          url: row.url,
          blobPath: row.blob_path,
          sortOrder: Number(row.sort_order),
          isCover: Boolean(row.is_cover),
          createdAt: row.created_at,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load public house images:", error);

    return NextResponse.json(
      { error: "Failed to load house images." },
      { status: 500 },
    );
  }
}