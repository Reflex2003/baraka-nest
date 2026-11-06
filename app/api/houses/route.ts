import { getHouseListings } from "@/lib/house-records";

export async function GET() {
  try {
    const houses = await getHouseListings();
    return Response.json({ houses });
  } catch (error) {
    console.error("Housing listings load error:", error);
    return Response.json({ error: "Housing listings are temporarily unavailable." }, { status: 503 });
  }
}
