export function formatJoinedAt(value) {
  const raw = String(value ?? "").trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
    ? raw
    : `${raw.replace(" ", "T")}${dateOnly ? "" : "Z"}`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit", hour12: true }),
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  const formattedDate = `${part("day")} ${part("month")} ${part("year")}`;
  return dateOnly
    ? `${formattedDate} · time unavailable EAT`
    : `${formattedDate} · ${part("hour")}:${part("minute")} ${part("dayPeriod").toUpperCase()} EAT`;
}

export function displayProfileList(value) {
  if (!value) return "—";
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string").join(", ") || "—"
      : value;
  } catch {
    return value;
  }
}
