import test from "node:test";
import assert from "node:assert/strict";
import { displayProfileList, formatJoinedAt } from "../lib/user-management.mjs";

test("account creation timestamps display the stored instant in East Africa Time", () => {
  assert.equal(formatJoinedAt("2026-11-11 23:14:00"), "12 Nov 2026 · 02:14 AM EAT");
  assert.equal(formatJoinedAt("2026-11-11T23:14:00Z"), "12 Nov 2026 · 02:14 AM EAT");
});

test("explicit offsets are preserved and date-only values do not invent a time", () => {
  assert.equal(formatJoinedAt("2026-11-11T23:14:00-05:00"), "12 Nov 2026 · 07:14 AM EAT");
  assert.equal(formatJoinedAt("2026-11-11"), "11 Nov 2026 · time unavailable EAT");
  assert.equal(formatJoinedAt("not-a-timestamp"), "Unknown");
});

test("roommate profile list fields are safely decoded for the admin details view", () => {
  assert.equal(displayProfileList('["music","football"]'), "music, football");
  assert.equal(displayProfileList("[]"), "—");
  assert.equal(displayProfileList("legacy text"), "legacy text");
});
