import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import type { HouseListing } from "@/lib/houses";

type HouseRow = Omit<HouseListing, "amenities" | "coordinates"> & {
  amenities: string;
  lat: number;
  lon: number;
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
    SELECT h.* FROM house_listing h
    LEFT JOIN house_control c ON c.house_id = h.id
    ${options.includeHidden ? "" : "WHERE COALESCE(c.is_hidden, 0) = 0"}
    ORDER BY COALESCE(c.is_featured, h.featured) DESC, h.updated_at DESC, h.name COLLATE NOCASE
  `).all() as unknown as HouseRow[];
  return rows.map(formatHouseRow);
}

export async function getHouseListing(id: string) {
  await ensureFeatureTables();
  const row = await roommateDb.prepare(`
    SELECT h.* FROM house_listing h
    LEFT JOIN house_control c ON c.house_id = h.id
    WHERE h.id = ? AND COALESCE(c.is_hidden, 0) = 0 LIMIT 1
  `).get(id) as unknown as HouseRow | undefined;
  return row ? formatHouseRow(row) : undefined;
}
