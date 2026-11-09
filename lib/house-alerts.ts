import { randomUUID } from "node:crypto";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";

type SavedSearch = {
  user_id: string;
  filters: string;
};

export type HouseSearchFilters = {
  location: string;
  type: string;
  maxPrice: number | null;
  query?: string;
};

function matchesFilters(
  filters: HouseSearchFilters,
  house: { name: string; county: string; location: string; type: string; price: number; monthlyBills: number },
) {
  const location = filters.location.trim().toLowerCase();
  const type = filters.type.trim().toLowerCase();
  const query = filters.query?.trim().toLowerCase() ?? "";

  if (
    location &&
    location !== "all locations" &&
    !house.county.toLowerCase().includes(location) &&
    !house.location.toLowerCase().includes(location)
  ) {
    return false;
  }

  if (type && type !== "all types" && house.type.toLowerCase() !== type) {
    return false;
  }

  if (
    query &&
    ![house.county, house.location, house.type, house.name]
      .some((value) => value.toLowerCase().includes(query))
  ) return false;

  return filters.maxPrice === null || house.price + house.monthlyBills <= filters.maxPrice;
}

export async function notifySavedSearchesForHouse(house: {
  id: string;
  name: string;
  county: string;
  location: string;
  type: string;
  price: number;
  monthlyBills: number;
}) {
  await ensureFeatureTables();

  const searches = (await roommateDb
    .prepare("SELECT user_id, filters FROM house_saved_search")
    .all()) as SavedSearch[];

  const notifications = new Map<string, string[]>();

  for (const search of searches) {
    let filters: HouseSearchFilters;

    try {
      filters = JSON.parse(search.filters) as HouseSearchFilters;
    } catch {
      continue;
    }

    if (!matchesFilters(filters, house)) continue;

    const current = notifications.get(search.user_id) ?? [];
    current.push(search.user_id);
    notifications.set(search.user_id, current);
  }

  for (const userId of notifications.keys()) {
    await roommateDb
      .prepare(`
        INSERT INTO in_app_notification (
          id, user_id, type, title, body, href
        ) VALUES (?, ?, 'new-house', ?, ?, ?)
      `)
      .run(
        randomUUID(),
        userId,
        "A new home matches your search",
        `${house.name} in ${house.location} is listed at an estimated KSh ${(house.price + house.monthlyBills).toLocaleString()} per month.`,
        `/houses/${encodeURIComponent(house.id)}`,
      );
  }
}
