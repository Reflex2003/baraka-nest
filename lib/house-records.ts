import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import type { HouseListing } from "@/lib/houses";

type HouseRow = Omit<HouseListing, "amenities" | "coordinates" | "monthlyBills"> & {
  amenities: string;
  monthly_bills: number;
  lat: number;
  lon: number;
  owner_user_id?: string | null;
  verification_status?: string;
  contact_phone?: string;
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
    coordinates: { lat: Number(row.lat), lon: Number(row.lon) },
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
  return rows.map((row) => ({
    ...formatHouseRow(row),
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
    media: media.map((item) => ({
      id: item.id,
      url: item.url,
      contentType: item.content_type ?? "image/jpeg",
      isCover: Boolean(item.is_cover),
      sortOrder: Number(item.sort_order),
    })),
  };
}
