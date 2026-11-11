import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import type { HouseListing } from "@/lib/houses";
import { mapUrlFromCoordinates, normalizeContactMethods, normalizeMapLocationUrl } from "@/lib/listing-input.mjs";

type HouseRow = Omit<HouseListing, "amenities" | "coordinates" | "monthlyBills"> & {
  amenities: string;
  monthly_bills: number;
  lat: number;
  lon: number;
  has_coordinates?: number;
  location_url?: string | null;
  furnishing?: string | null;
  contact_phone?: string | null;
  owner_user_id?: string | null;
  verification_status?: string;
  owner_name?: string | null;
  owner_member_since?: string | null;
  owner_listing_count?: number;
};

function parseAmenities(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function formatHouseRow(row: HouseRow): HouseListing {
  const accent = row.accent === "dark" || row.accent === "soft" ? row.accent : "light";
  const validStoredCoordinates = Number.isFinite(Number(row.lat)) && Number.isFinite(Number(row.lon)) && Number(row.lat) >= -5 && Number(row.lat) <= 6 && Number(row.lon) >= 33 && Number(row.lon) <= 42;
  const hasCoordinates = row.has_coordinates === undefined ? validStoredCoordinates : Number(row.has_coordinates) === 1;
  const coordinates = hasCoordinates && validStoredCoordinates ? { lat: Number(row.lat), lon: Number(row.lon) } : null;
  const locationUrl = normalizeMapLocationUrl(row.location_url) || (coordinates ? mapUrlFromCoordinates(coordinates.lat, coordinates.lon) : "") || null;
  const legacyContacts = normalizeContactMethods({ phone: row.contact_phone ?? "" });
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    county: row.county,
    distance: row.distance,
    price: Number(row.price),
    deposit: Number(row.deposit ?? 0),
    monthlyBills: Number(row.monthly_bills ?? 0),
    type: row.type,
    rooms: row.rooms,
    available: Number(row.available),
    rating: row.rating,
    featured: Boolean(row.featured),
    accent,
    description: row.description,
    amenities: parseAmenities(row.amenities),
    coordinates,
    locationUrl,
    furnishing: row.furnishing ?? null,
    contactPhone: row.contact_phone ?? "",
    contactMethods: legacyContacts.valid ? legacyContacts.methods : [],
  };
}

export async function getHouseListings(options: { includeHidden?: boolean } = {}) {
  await ensureFeatureTables();
  const rows = await roommateDb.prepare(`
    SELECT h.*, u.name AS owner_name, u.createdAt AS owner_member_since,
      (SELECT COUNT(*) FROM house_listing owned WHERE owned.owner_user_id = h.owner_user_id) AS owner_listing_count
    FROM house_listing h
    LEFT JOIN "user" u ON u.id = h.owner_user_id
    LEFT JOIN house_control c ON c.house_id = h.id
    ${options.includeHidden ? "" : "WHERE COALESCE(c.is_hidden, 0) = 0 AND COALESCE(h.verification_status, 'unverified') NOT IN ('suspended', 'under_review')"}
    ORDER BY COALESCE(c.is_featured, h.featured) DESC, h.updated_at DESC, h.name COLLATE NOCASE
  `).all() as unknown as HouseRow[];
  const ids = rows.map((row) => row.id);
  const contactRows = ids.length ? await roommateDb.prepare(`
    SELECT id, house_id, kind, platform, label, value, url
    FROM house_contact_method WHERE house_id IN (${ids.map(() => "?").join(",")})
    ORDER BY sort_order ASC, created_at ASC
  `).all(...ids) as { id: string; house_id: string; kind: string; platform: string; label: string; value: string; url: string }[] : [];
  const contactsByHouse = new Map<string, HouseListing["contactMethods"]>();
  for (const item of contactRows) {
    const list = contactsByHouse.get(item.house_id) ?? [];
    list.push({ id: item.id, kind: item.kind as "phone" | "whatsapp" | "social", platform: item.platform as "phone" | "whatsapp" | "instagram" | "facebook" | "telegram" | "tiktok" | "x" | "link", label: item.label, value: item.value, url: item.url });
    contactsByHouse.set(item.house_id, list);
  }
  return rows.map((row) => ({
    ...formatHouseRow(row),
    contactMethods: contactsByHouse.get(row.id)?.length ? contactsByHouse.get(row.id) : formatHouseRow(row).contactMethods,
    ownerUserId: row.owner_user_id ?? null,
    verificationStatus: (row.verification_status && ["pending", "verified", "unverified", "under_review", "suspended"].includes(row.verification_status)
      ? row.verification_status
      : "unverified") as HouseListing["verificationStatus"],
    ownerName: row.owner_name ?? null,
    ownerMemberSince: row.owner_member_since ?? null,
    ownerListingCount: Number(row.owner_listing_count ?? 0),
  }));
}

export async function getHouseListing(id: string) {
  await ensureFeatureTables();
  const row = await roommateDb.prepare(`
    SELECT h.*, u.name AS owner_name, u.createdAt AS owner_member_since,
      (SELECT COUNT(*) FROM house_listing owned WHERE owned.owner_user_id = h.owner_user_id) AS owner_listing_count
    FROM house_listing h
    LEFT JOIN "user" u ON u.id = h.owner_user_id
    LEFT JOIN house_control c ON c.house_id = h.id
    WHERE h.id = ? AND COALESCE(c.is_hidden, 0) = 0 AND COALESCE(h.verification_status, 'unverified') NOT IN ('suspended', 'under_review') LIMIT 1
  `).get(id) as unknown as HouseRow | undefined;
  if (!row) return undefined;
  const media = await roommateDb.prepare(`
    SELECT id, url, content_type, is_cover, sort_order
    FROM house_image WHERE house_id = ?
    ORDER BY is_cover DESC, sort_order ASC, created_at ASC
  `).all(id) as { id: string; url: string; content_type?: string; is_cover: number; sort_order: number }[];
  const contactRows = await roommateDb.prepare(`
    SELECT id, kind, platform, label, value, url FROM house_contact_method
    WHERE house_id = ? ORDER BY sort_order ASC, created_at ASC
  `).all(id) as { id: string; kind: string; platform: string; label: string; value: string; url: string }[];
  const formatted = formatHouseRow(row);
  return {
    ...formatted,
    ownerUserId: row.owner_user_id ?? null,
    verificationStatus: (row.verification_status && ["pending", "verified", "unverified", "under_review", "suspended"].includes(row.verification_status)
      ? row.verification_status
      : "unverified") as HouseListing["verificationStatus"],
    ownerName: row.owner_name ?? null,
    ownerMemberSince: row.owner_member_since ?? null,
    ownerListingCount: Number(row.owner_listing_count ?? 0),
    contactMethods: contactRows.length ? contactRows.map((item) => ({ id: item.id, kind: item.kind as "phone" | "whatsapp" | "social", platform: item.platform as "phone" | "whatsapp" | "instagram" | "facebook" | "telegram" | "tiktok" | "x" | "link", label: item.label, value: item.value, url: item.url })) : formatted.contactMethods,
    media: media.map((item) => ({
      id: item.id,
      url: item.url,
      contentType: item.content_type ?? "image/jpeg",
      isCover: Boolean(item.is_cover),
      sortOrder: Number(item.sort_order),
    })),
  };
}
