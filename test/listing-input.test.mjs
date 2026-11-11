import test from "node:test";
import assert from "node:assert/strict";
import {
  coordinatesFromMapUrl,
  detectSocialPlatform,
  mapUrlFromCoordinates,
  normalizeAmenities,
  normalizeContactMethods,
  normalizeHouseType,
  normalizeMapLocationUrl,
  parseOptionalInteger,
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
  assert.equal(contacts.methods[1].url, "https://wa.me/0712345678");
  assert.equal(normalizeContactMethods({ phone: "12" }).valid, false);
});

test("media validation matches extension, MIME and file-size constraints", () => {
  assert.equal(validateMediaFileMetadata("flat.jpg", "image/jpeg", 1024).valid, true);
  assert.equal(validateMediaFileMetadata("walkthrough.mp4", "video/mp4", 1024).valid, true);
  assert.equal(validateMediaFileMetadata("walkthrough.mp4", "image/jpeg", 1024).valid, false);
  assert.equal(validateMediaFileMetadata("payload.exe", "application/octet-stream", 1024).valid, false);
  assert.equal(validateMediaFileMetadata("large.webm", "video/webm", 101 * 1024 * 1024).valid, false);
});
