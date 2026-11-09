import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await query<{
      id: string;
      name: string | null;
      image: string | null;
    }>(
      "SELECT id, name, image FROM user WHERE username = ? LIMIT 1",
      ["reflex001"],
    );

    const admin = result.rows[0];

    return NextResponse.json(
      {
        id: admin?.id || "",
        name: admin?.name || "Baraka Nest Admin",
        image: admin?.image || "/admin-profile.jpg",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Admin profile lookup failed:", error);

    return NextResponse.json(
      { error: "Could not load admin profile." },
      { status: 500 },
    );
  }
}
