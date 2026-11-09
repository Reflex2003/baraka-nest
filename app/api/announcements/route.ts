import { getAnnouncements } from "@/lib/announcement-data";

export async function GET() {
  try {
    return Response.json({ announcements: await getAnnouncements(true) }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Announcements load error:", error);
    return Response.json({ error: "Announcements could not be loaded." }, { status: 503 });
  }
}
