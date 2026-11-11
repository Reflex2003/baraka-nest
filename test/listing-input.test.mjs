import test from "node:test";
import assert from "node:assert/strict";
import {
  coordinatesFromMapUrl,
  detectSocialPlatform,
  mapUrlFromCoordinates,
  mergeCanonicalPhoneContactMethods,
  normalizeAmenities,
  normalizeContactMethods,
  normalizeHouseType,
  normalizeMapLocationUrl,
  parseOptionalInteger,
  parseOptionalIntegerOrCurrent,
  resolveListingLocation,
  validateMediaFileMetadata,
} from "../lib/listing-input.mjs";

test("map links validate safely and coordinate links preserve the map point", () => {
  assert.equal(normalizeMapLocationUrl("javascript:alert(1)"), "");
  assert.equal(normalizeMapLocationUrl("http://maps.google.com/?q=-1.2,36.8"), "");
  assert.deepEqual(coordinatesFromMapUrl("https://www.google.com/maps/@-1.2,36.8,15z"), { lat: -1.2, lon: 36.8 });
  assert.deepEqual(coordinatesFromMapUrl("https://www.openstreetmap.org/?mlat=-1.2&mlon=36.8#map=16/-1.2/36.8"), { lat: -1.2, lon: 36.8 });
  assert.match(mapUrlFromCoordinates(-1.2, 36.8), /openstreetmap\.org/);
});

test("optional numeric fields can stay blank and accept clean edited values", () => {
  assert.deepEqual(parseOptionalInteger(""), { valid: true, value: null });
  assert.deepEqual(parseOptionalInteger("8000", { minimum: 500 }), { valid: true, value: 8000 });
  assert.equal(parseOptionalInteger("00008000").value, 8000);
  assert.equal(parseOptionalInteger("8,000").valid, false);
  assert.equal(parseOptionalInteger("499", { minimum: 500 }).valid, false);
});

test("blank or omitted optional admin numeric edits preserve the stored value", () => {
  assert.deepEqual(parseOptionalIntegerOrCurrent("", 12500, { minimum: 500 }), { valid: true, value: 12500 });
  assert.deepEqual(parseOptionalIntegerOrCurrent(undefined, 0), { valid: true, value: 0 });
  assert.deepEqual(parseOptionalIntegerOrCurrent("7000", 12500, { minimum: 500 }), { valid: true, value: 7000 });
  assert.equal(parseOptionalIntegerOrCurrent("8,000", 12500).valid, false);
});

test("location edits preserve legacy coordinates and add map links without destructive fallback", () => {
  const existing = { lat: -1.2864, lon: 36.7892, has_coordinates: 1, location_url: null };
  const untouched = resolveListingLocation({}, existing);
  assert.deepEqual(untouched.coordinates, { lat: -1.2864, lon: 36.7892 });
  assert.match(untouched.locationUrl, /openstreetmap\.org/);
  const blank = resolveListingLocation({ lat: "", lon: "", locationUrl: "" }, existing);
  assert.deepEqual(blank.coordinates, { lat: existing.lat, lon: existing.lon });
  assert.match(blank.locationUrl, /openstreetmap\.org/);
  const linked = resolveListingLocation({ locationUrl: "https://www.google.com/maps/@-1.3,36.9,15z", lat: "", lon: "" }, existing);
  assert.deepEqual(linked.coordinates, { lat: -1.3, lon: 36.9 });
  assert.equal(resolveListingLocation({ lat: "-1.2" }, existing).valid, false);
});

test("custom house types and amenities remain available", () => {
  assert.equal(normalizeHouseType("Other", "Loft / annex"), "Loft / annex");
  assert.deepEqual(normalizeAmenities(["Wi-Fi", "CCTV"], "CCTV, Solar power"), ["Wi-Fi", "CCTV", "Solar power"]);
});

test("social links detect the requested platforms and safely retain unknown links", () => {
  for (const [url, platform] of [
    ["https://instagram.com/keja", "instagram"], ["https://facebook.com/keja", "facebook"],
    ["https://t.me/keja", "telegram"], ["https://tiktok.com/@keja", "tiktok"],
    ["https://x.com/keja", "x"], ["https://example.org/keja", "link"],
  ]) assert.equal(detectSocialPlatform(url)?.platform, platform);
  assert.equal(detectSocialPlatform("javascript:alert(1)"), null);
  const contacts = normalizeContactMethods({ phone: "+254 712 345 678", whatsapp: "0712345678", socials: ["https://instagram.com/keja"] });
  assert.equal(contacts.valid, true);
  assert.deepEqual(contacts.methods.map(({ kind, platform }) => [kind, platform]), [["phone", "phone"], ["whatsapp", "whatsapp"], ["social", "instagram"]]);
  assert.equal(contacts.methods[1].url, "https://wa.me/254712345678");
  assert.equal(normalizeContactMethods({ phone: "12" }).valid, false);
});

test("legacy canonical phone adds Call and WhatsApp links while preserving other stored contacts", () => {
  const social = { kind: "social", platform: "instagram", label: "Instagram", value: "https://instagram.com/keja", url: "https://instagram.com/keja" };
  const methods = mergeCanonicalPhoneContactMethods([social], "+254 712 345 678");
  assert.deepEqual(methods.map((item) => item.kind), ["phone", "whatsapp", "social"]);
  assert.equal(methods[0].value, "+254712345678");
  assert.equal(methods[0].url, "tel:+254712345678");
  assert.equal(methods[1].value, "+254712345678");
  assert.equal(methods[1].url, "https://wa.me/254712345678");
  assert.equal(methods[2].url, social.url);
  const local = normalizeContactMethods({ phone: "0712 345 678", whatsapp: "0712 345 678" });
  assert.equal(local.methods[1].url, "https://wa.me/254712345678");
});

test("media validation matches extension, MIME and file-size constraints", () => {
  assert.equal(validateMediaFileMetadata("flat.jpg", "image/jpeg", 1024).valid, true);
  assert.equal(validateMediaFileMetadata("walkthrough.mp4", "video/mp4", 1024).valid, true);
  assert.equal(validateMediaFileMetadata("walkthrough.mp4", "image/jpeg", 1024).valid, false);
  assert.equal(validateMediaFileMetadata("payload.exe", "application/octet-stream", 1024).valid, false);
  assert.equal(validateMediaFileMetadata("large.webm", "video/webm", 101 * 1024 * 1024).valid, false);
});
