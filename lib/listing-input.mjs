const MEDIA_TYPES = Object.freeze({
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
});

const MAP_HOSTS = [
  "google.com", "google.co.ke", "goo.gl", "maps.app.goo.gl",
  "openstreetmap.org", "apple.com", "waze.com", "here.com", "bing.com",
];

const SOCIAL_HOSTS = [
  ["instagram", ["instagram.com"]],
  ["facebook", ["facebook.com", "fb.com"]],
  ["telegram", ["t.me", "telegram.me", "telegram.org"]],
  ["tiktok", ["tiktok.com"]],
  ["x", ["x.com", "twitter.com"]],
];

function hostMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function normalizeMapLocationUrl(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    const host = url.hostname.toLowerCase();
    return MAP_HOSTS.some((domain) => hostMatches(host, domain)) ? url.toString() : "";
  } catch {
    return "";
  }
}

export function mapUrlFromCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -5 || lat > 6 || lon < 33 || lon > 42) return "";
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

export function coordinatesFromMapUrl(value) {
  const safeUrl = normalizeMapLocationUrl(value);
  if (!safeUrl) return null;
  const url = new URL(safeUrl);
  const text = `${url.pathname} ${url.search} ${url.hash}`;
  const patterns = [
    /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/,
    /(?:[?&#]|^)q=(-?\d{1,2}(?:\.\d+)?)[,%20]+(-?\d{1,3}(?:\.\d+)?)/,
    /(?:[?&#]|^)ll=(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/,
    /(?:[?&#]|^)mlat=(-?\d{1,2}(?:\.\d+)?).*?(?:[?&#]|^)mlon=(-?\d{1,3}(?:\.\d+)?)/,
    /#map=\d+\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (mapUrlFromCoordinates(lat, lon)) return { lat, lon };
  }
  return null;
}

export function detectSocialPlatform(value) {
  const text = typeof value === "string" ? value.trim() : "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    for (const [platform, domains] of SOCIAL_HOSTS) {
      if (domains.some((domain) => hostMatches(host, domain))) return { platform, url: url.toString() };
    }
    return { platform: "link", url: url.toString() };
  } catch {
    return null;
  }
}

export function validateMediaFileMetadata(fileName, contentType, size, maximumBytes = 100 * 1024 * 1024) {
  const extension = String(fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  const expectedType = MEDIA_TYPES[extension];
  const mime = String(contentType ?? "").split(";", 1)[0].trim().toLowerCase();
  const bytes = Number(size);
  if (!expectedType || mime !== expectedType) return { valid: false, reason: "File extension and MIME type must match a supported image or video format." };
  if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > maximumBytes) return { valid: false, reason: `Media files must be between 1 byte and ${Math.floor(maximumBytes / 1024 / 1024)}MB.` };
  return { valid: true, contentType: expectedType, kind: expectedType.startsWith("video/") ? "video" : "image", size: bytes };
}

export function parseOptionalInteger(value, { minimum = 0, maximum = 1_000_000 } = {}) {
  const text = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  if (!text) return { valid: true, value: null };
  if (!/^\d+$/.test(text)) return { valid: false, value: null };
  const number = Number(text);
  return Number.isSafeInteger(number) && number >= minimum && number <= maximum
    ? { valid: true, value: number }
    : { valid: false, value: null };
}

/** Keep an existing stored number when an edit input is temporarily blank or omitted. */
export function parseOptionalIntegerOrCurrent(value, current, options = {}) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return current === undefined || current === null
      ? { valid: true, value: null }
      : parseOptionalInteger(current, options);
  }
  return parseOptionalInteger(value, options);
}

/** Resolve a location-link edit without clearing legacy coordinates when inputs are blank. */
export function resolveListingLocation(body = {}, existing = {}) {
  const owns = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const oldUrl = normalizeMapLocationUrl(existing.location_url ?? existing.locationUrl ?? "");
  const rawUrl = owns("locationUrl") ? body.locationUrl : oldUrl;
  const locationUrl = normalizeMapLocationUrl(typeof rawUrl === "string" ? rawUrl : "");
  if (String(rawUrl ?? "").trim() && !locationUrl) return { valid: false, error: "Paste a valid HTTPS Google Maps, OpenStreetMap, Apple Maps, Waze, HERE or Bing Maps link." };

  const rawLat = body.lat;
  const rawLon = body.lon;
  const hasLat = rawLat !== undefined && rawLat !== null && String(rawLat).trim() !== "";
  const hasLon = rawLon !== undefined && rawLon !== null && String(rawLon).trim() !== "";
  if (hasLat !== hasLon) return { valid: false, error: "Enter both map coordinates or leave both blank." };

  const urlCoordinates = locationUrl ? coordinatesFromMapUrl(locationUrl) : null;
  const urlChanged = owns("locationUrl") && locationUrl !== oldUrl;
  let coordinates = null;
  if (urlChanged && urlCoordinates) coordinates = urlCoordinates;
  else if (hasLat && hasLon) {
    const lat = Number(rawLat); const lon = Number(rawLon);
    if (!mapUrlFromCoordinates(lat, lon)) return { valid: false, error: "Enter valid Kenya latitude and longitude values." };
    coordinates = { lat, lon };
  } else if (urlCoordinates) coordinates = urlCoordinates;
  else {
    const oldLat = Number(existing.lat); const oldLon = Number(existing.lon);
    const oldHasCoordinates = existing.has_coordinates === undefined
      ? Number.isFinite(oldLat) && Number.isFinite(oldLon) && Boolean(mapUrlFromCoordinates(oldLat, oldLon))
      : Number(existing.has_coordinates) === 1;
    if (oldHasCoordinates) coordinates = { lat: oldLat, lon: oldLon };
  }

  const resolvedUrl = locationUrl || (coordinates ? mapUrlFromCoordinates(coordinates.lat, coordinates.lon) : "");
  return { valid: true, coordinates, hasCoordinates: Boolean(coordinates), locationUrl: resolvedUrl || null };
}

export function normalizeHouseType(value, customValue = "") {
  return String(customValue || value || "").trim().replace(/\s+/g, " ").slice(0, 60);
}

export function normalizeAmenities(selected, customValues = "") {
  const common = Array.isArray(selected) ? selected : [];
  const custom = String(customValues ?? "").split(/[\n,]/).map((value) => value.trim());
  return [...new Set([...common, ...custom].filter((value) => typeof value === "string" && value.length > 0).map((value) => value.slice(0, 100)))].slice(0, 20);
}

/** @typedef {{kind: "phone" | "whatsapp" | "social", platform: "phone" | "whatsapp" | "instagram" | "facebook" | "telegram" | "tiktok" | "x" | "link", label: string, value: string, url: string}} ContactMethod */
/** @param {{phone?: string, whatsapp?: string, whatsappUrl?: string, socials?: string[]}} [input] @returns {{valid: boolean, methods: ContactMethod[], error: string}} */
export function normalizeContactMethods({ phone = "", whatsapp = "", whatsappUrl = "", socials = [] } = {}) {
  const methods = [];
  const phoneNumber = String(phone).trim().replace(/[\s()-]/g, "");
  if (phoneNumber) {
    if (!/^\+?[0-9]{9,15}$/.test(phoneNumber)) return { valid: false, methods: [], error: "Enter a phone number with 9 to 15 digits." };
    methods.push({ kind: "phone", platform: "phone", label: "Phone", value: phoneNumber, url: `tel:${phoneNumber}` });
  }
  const whatsappNumber = String(whatsapp).trim().replace(/[\s()-]/g, "");
  const whatsappLink = String(whatsappUrl).trim();
  if (whatsappNumber && whatsappLink) return { valid: false, methods: [], error: "Use either a WhatsApp number or a WhatsApp link." };
  if (whatsappNumber) {
    if (!/^\+?[0-9]{9,15}$/.test(whatsappNumber)) return { valid: false, methods: [], error: "Enter a WhatsApp number with 9 to 15 digits." };
    const digits = whatsappNumber.replace(/^\+/, "");
    const international = /^0[17]\d{8}$/.test(digits) ? `254${digits.slice(1)}` : digits;
    methods.push({ kind: "whatsapp", platform: "whatsapp", label: "WhatsApp", value: whatsappNumber, url: `https://wa.me/${international}` });
  } else if (whatsappLink) {
    const detected = detectSocialPlatform(whatsappLink);
    let parsed;
    try { parsed = new URL(whatsappLink); } catch { parsed = null; }
    const validWhatsAppHost = parsed && ["wa.me", "api.whatsapp.com", "whatsapp.com"].some((domain) => hostMatches(parsed.hostname.toLowerCase(), domain));
    if (!detected || !validWhatsAppHost) return { valid: false, methods: [], error: "Paste a valid HTTPS WhatsApp link." };
    methods.push({ kind: "whatsapp", platform: "whatsapp", label: "WhatsApp", value: parsed.toString(), url: parsed.toString() });
  }
  for (const input of Array.isArray(socials) ? socials : []) {
    const link = detectSocialPlatform(input);
    if (input && !link) return { valid: false, methods: [], error: "Social links must use a valid HTTPS URL." };
    if (link) methods.push({ kind: "social", platform: link.platform, label: link.platform === "link" ? "Link" : link.platform[0].toUpperCase() + link.platform.slice(1), value: link.url, url: link.url });
  }
  return { valid: true, methods: methods.slice(0, 12), error: "" };
}

/** Add public Call and WhatsApp actions from the canonical legacy phone without rewriting stored data. */
export function mergeCanonicalPhoneContactMethods(methods, phone) {
  const existing = Array.isArray(methods) ? methods.filter((item) => item && typeof item.url === "string") : [];
  const rawPhone = typeof phone === "string" ? phone : "";
  if (!rawPhone.trim()) return existing;
  const canonical = normalizeContactMethods({ phone: rawPhone, whatsapp: rawPhone });
  if (!canonical.valid) return existing;
  const call = canonical.methods.find((item) => item.kind === "phone");
  const storedWhatsapp = existing.find((item) => item.kind === "whatsapp");
  const whatsapp = storedWhatsapp ?? canonical.methods.find((item) => item.kind === "whatsapp");
  const retained = existing.filter((item) => item.kind !== "phone" && item.kind !== "whatsapp");
  const result = [call, whatsapp, ...retained].filter(Boolean);
  const seen = new Set();
  return result.filter((item) => {
    const key = `${item.kind}|${item.platform}|${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { MEDIA_TYPES };
