import { getHouseListings } from "@/lib/house-records";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";
import { isKenyanCounty } from "@/lib/kenya-counties";
import { coordinatesFromMapUrl, mapUrlFromCoordinates, normalizeContactMethods, normalizeHouseType, normalizeMapLocationUrl, parseOptionalInteger } from "@/lib/listing-input.mjs";

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
    const type = normalizeHouseType(body.type, typeof body.customType === "string" ? body.customType : "");
    const rooms = typeof body.rooms === "string" ? body.rooms.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const parsedPrice = parseOptionalInteger(body.price, { minimum: 500 });
    const parsedDeposit = parseOptionalInteger(body.deposit);
    const parsedBills = parseOptionalInteger(body.monthlyBills);
    const price = parsedPrice.value;
    const deposit = parsedDeposit.value ?? 0;
    const monthlyBills = parsedBills.value ?? 0;
    const available = Number(body.available ?? 1);
    const mapUrl = normalizeMapLocationUrl(typeof body.locationUrl === "string" ? body.locationUrl : "");
    if (body.locationUrl && !mapUrl) return Response.json({ error: "Paste a valid HTTPS Google Maps, OpenStreetMap, Apple Maps, Waze, HERE or Bing Maps link." }, { status: 400 });
    const parsedCoordinates = mapUrl ? coordinatesFromMapUrl(mapUrl) : null;
    const legacyLat = Number(body.lat);
    const legacyLon = Number(body.lon);
    const coordinates = parsedCoordinates ?? (Number.isFinite(legacyLat) && legacyLat >= -5 && legacyLat <= 6 && Number.isFinite(legacyLon) && legacyLon >= 33 && legacyLon <= 42 ? { lat: legacyLat, lon: legacyLon } : null);
    const contacts = normalizeContactMethods({ phone: typeof body.phone === "string" ? body.phone : typeof body.contactPhone === "string" ? body.contactPhone : "", whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : "", whatsappUrl: typeof body.whatsappUrl === "string" ? body.whatsappUrl : "", socials: Array.isArray(body.socials) ? body.socials.filter((value): value is string => typeof value === "string") : [] });
    const furnishing = typeof body.customFurnishing === "string" && body.customFurnishing.trim() ? body.customFurnishing.trim().slice(0, 60) : typeof body.furnishing === "string" ? body.furnishing.trim().slice(0, 60) : "";
    const amenities = Array.isArray(body.amenities) ? body.amenities.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean).slice(0, 20) : [];
    if (name.length < 3 || name.length > 100 || location.length < 2 || location.length > 120 || !isKenyanCounty(county) || type.length < 2 || type.length > 60 || rooms.length < 1 || rooms.length > 60 || description.length < 20 || description.length > 2000 || !parsedPrice.valid || price === null || price > 1000000 || !parsedDeposit.valid || !parsedBills.valid || deposit > 1000000 || monthlyBills > 1000000 || !Number.isInteger(available) || available < 0 || available > 1000 || amenities.some((value) => value.length > 100) || !contacts.valid) {
      return Response.json({ error: "Check the house details, county, rent and map coordinates." }, { status: 400 });
    }
    await ensureFeatureTables();
    const id = randomUUID();
    await roommateDb.prepare(`
      INSERT INTO house_listing (id, name, location, county, distance, price, type, rooms, available, rating, featured, accent, description, amenities, lat, lon, deposit, monthly_bills, owner_user_id, verification_status, contact_phone, location_url, has_coordinates, furnishing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 0, 'light', ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `).run(id, name, location, county, typeof body.distance === "string" ? body.distance.trim().slice(0, 100) : "", price, type, rooms, available, description, JSON.stringify(amenities), coordinates?.lat ?? 0, coordinates?.lon ?? 0, deposit, monthlyBills, session.user.id, contacts.methods.find((method) => method.kind === "phone")?.value ?? "", mapUrl || (coordinates ? mapUrlFromCoordinates(coordinates.lat, coordinates.lon) : null), coordinates ? 1 : 0, furnishing || null);
    for (const [sortOrder, method] of contacts.methods.entries()) {
      await roommateDb.prepare(`INSERT INTO house_contact_method (id, house_id, kind, platform, label, value, url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), id, method.kind, method.platform, method.label, method.value, method.url, sortOrder);
    }
    return Response.json({ success: true, id, verificationStatus: "pending" }, { status: 201 });
  } catch (error) {
    console.error("House listing creation failed:", error);
    return Response.json({ error: "Your listing could not be created right now." }, { status: 500 });
  }
}
