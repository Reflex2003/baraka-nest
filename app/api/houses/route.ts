import { getHouseListings } from "@/lib/house-records";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";
import { houseTypes } from "@/lib/house-types";
import { isKenyanCounty } from "@/lib/kenya-counties";

export async function GET() {
  try {
    const houses = await getHouseListings();
    return Response.json({ houses });
  } catch (error) {
    console.error("Housing listings load error:", error);
    return Response.json({ error: "Housing listings are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in before creating a listing." }, { status: 401 });
    if (Number(request.headers.get("content-length") ?? 0) > 12000) return Response.json({ error: "Listing data is too large." }, { status: 413 });
    const body = await request.json() as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const county = typeof body.county === "string" ? body.county.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const contactPhone = typeof body.contactPhone === "string" ? body.contactPhone.trim().replace(/[\s()-]/g, "") : "";
    const rooms = typeof body.rooms === "string" ? body.rooms.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const deposit = Number(body.deposit ?? 0);
    const monthlyBills = Number(body.monthlyBills ?? 0);
    const available = Number(body.available ?? 1);
    const lat = Number(body.lat);
    const lon = Number(body.lon);
    const amenities = Array.isArray(body.amenities) ? body.amenities.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean).slice(0, 20) : [];
    if (name.length < 3 || name.length > 100 || location.length < 2 || location.length > 120 || !isKenyanCounty(county) || !houseTypes.includes(type as (typeof houseTypes)[number]) || rooms.length < 1 || rooms.length > 60 || description.length < 20 || description.length > 2000 || !/^\+?[0-9]{9,15}$/.test(contactPhone) || !Number.isInteger(price) || price < 500 || price > 1000000 || !Number.isInteger(deposit) || deposit < 0 || deposit > 1000000 || !Number.isInteger(monthlyBills) || monthlyBills < 0 || monthlyBills > 1000000 || !Number.isInteger(available) || available < 0 || available > 1000 || !Number.isFinite(lat) || lat < -5 || lat > 6 || !Number.isFinite(lon) || lon < 33 || lon > 42 || amenities.some((value) => value.length > 100)) {
      return Response.json({ error: "Check the house details, county, rent and map coordinates." }, { status: 400 });
    }
    await ensureFeatureTables();
    const id = randomUUID();
    await roommateDb.prepare(`
      INSERT INTO house_listing (id, name, location, county, distance, price, type, rooms, available, rating, featured, accent, description, amenities, lat, lon, deposit, monthly_bills, owner_user_id, verification_status, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 0, 'light', ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, name, location, county, typeof body.distance === "string" ? body.distance.trim().slice(0, 100) : "", price, type, rooms, available, description, JSON.stringify(amenities), lat, lon, deposit, monthlyBills, session.user.id, contactPhone);
    return Response.json({ success: true, id, verificationStatus: "pending" }, { status: 201 });
  } catch (error) {
    console.error("House listing creation failed:", error);
    return Response.json({ error: "Your listing could not be created right now." }, { status: 500 });
  }
}
