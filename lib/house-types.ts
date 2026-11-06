export const houseTypes = [
  "Single Room",
  "Double Room",
  "Bedsitter/Studio",
  "1 Bedroom",
  "2 Bedroom",
] as const;

/** Normalize older listing labels for filtering without rewriting stored records. */
export function canonicalHouseType(value: string) {
  const normalized = value.trim().toLocaleLowerCase().replaceAll(/\s+/g, " ");
  if (normalized.includes("single")) return "Single Room";
  if (normalized.includes("double")) return "Double Room";
  if (normalized.includes("bedsitter") || normalized.includes("studio")) return "Bedsitter/Studio";
  if (normalized === "1 bedroom" || normalized === "one bedroom" || normalized === "1-bedroom") return "1 Bedroom";
  if (normalized === "2 bedroom" || normalized === "two bedroom" || normalized === "2-bedroom") return "2 Bedroom";
  return value;
}
