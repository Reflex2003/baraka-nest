import { del } from "@vercel/blob";
import { auth } from "@/lib/better-auth";
import { isSameOriginMutation } from "@/lib/request-security";
import { isSuperAdminUserId, recordAdminAction } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import { getHouseListings } from "@/lib/house-records";
import { coordinatesFromMapUrl, mapUrlFromCoordinates, normalizeAmenities, normalizeContactMethods, normalizeHouseType, normalizeMapLocationUrl, parseOptionalInteger } from "@/lib/listing-input.mjs";
import { isKenyanCounty } from "@/lib/kenya-counties";
import { notifySavedSearchesForHouse } from "@/lib/house-alerts";
import { randomUUID } from "node:crypto";

async function authorized(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user && (await isSuperAdminUserId(session.user.id))
    ? session.user
    : null;
}

export async function GET(request: Request) {
  try {
    const user = await authorized(request);

    if (!user) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }

    await ensureFeatureTables();
    const userSearch = (new URL(request.url).searchParams.get("userSearch") ?? "").trim().slice(0, 100);
    const userPattern = `%${userSearch}%`;

    const [
      users,
      reports,
      controls,
      roommates,
      openReports,
      listings,
      reviews,
      houseReports,
      userCount,
    ] = await Promise.all([
      roommateDb
        .prepare(`
          SELECT
            u.id,
            u.name,
            u.username,
            u.email,
            u.createdAt,
            COALESCE(u.is_suspended, 0) AS is_suspended,
            COALESCE(u.is_verified, 0) AS is_verified,
            COALESCE(u.is_deleted, 0) AS is_deleted,
            CASE WHEN u.username = 'reflex001' THEN 1 ELSE 0 END AS is_protected,
            rp.id AS roommate_profile_id,
            COALESCE(rp.is_hidden, 0) AS roommate_profile_is_hidden,
            COALESCE(rp.is_verified, 0) AS roommate_profile_is_verified,
            (SELECT COUNT(*) FROM house_listing h WHERE h.owner_user_id = u.id) AS owned_listing_count,
            (SELECT COUNT(*) FROM message m WHERE m.sender_user_id = u.id OR m.receiver_user_id = u.id) AS activity_message_count,
            rp.name AS roommate_profile_name,
            rp.age AS roommate_profile_age,
            rp.school AS roommate_profile_school,
            rp.gender AS roommate_profile_gender,
            rp.location AS roommate_profile_location,
            rp.budget AS roommate_profile_budget,
            rp.move_in AS roommate_profile_move_in,
            rp.preference AS roommate_profile_preference,
            rp.about AS roommate_profile_about,
            rp.interests AS roommate_profile_interests,
            rp.lifestyle AS roommate_profile_lifestyle,
            rp.created_at AS roommate_profile_created_at
          FROM "user" u
          LEFT JOIN roommate_profile rp
            ON rp.user_id = u.id
          WHERE (? = '' OR lower(u.name) LIKE lower(?) OR lower(u.email) LIKE lower(?) OR lower(COALESCE(u.username, '')) LIKE lower(?) OR u.id = ?)
          ORDER BY u.createdAt DESC
          LIMIT 250
        `)
        .all(userSearch, userPattern, userPattern, userPattern, userSearch),

      roommateDb
        .prepare(`
          SELECT
            r.id,
            r.reporter_user_id,
            r.reported_user_id,
            r.category,
            r.details,
            r.status,
            r.created_at,
            COALESCE(target.name, 'Student') AS reported_name,
            COALESCE(reporter.name, 'Student') AS reporter_name
          FROM moderation_report r
          LEFT JOIN roommate_profile target
            ON target.user_id = r.reported_user_id
          LEFT JOIN roommate_profile reporter
            ON reporter.user_id = r.reporter_user_id
          ORDER BY
            CASE r.status
              WHEN 'open' THEN 0
              ELSE 1
            END,
            r.created_at DESC
          LIMIT 250
        `)
        .all(),

      roommateDb
        .prepare(`
          SELECT
            house_id,
            is_hidden,
            is_featured
          FROM house_control
        `)
        .all(),
      roommateDb
        .prepare(`
          SELECT COUNT(*) AS count
          FROM roommate_profile
        `)
        .get() as Promise<{ count: number }>,

      roommateDb
        .prepare(`
          SELECT COUNT(*) AS count
          FROM moderation_report
          WHERE status = 'open'
        `)
        .get() as Promise<{ count: number }>,

      getHouseListings({ includeHidden: true }),

      roommateDb
        .prepare(`
          SELECT
            r.id,
            r.house_id,
            r.user_id,
            COALESCE(u.name, 'Student') AS username,
            r.rating,
            r.comment,
            r.status,
            r.created_at,
            r.updated_at,
            h.name AS house_name
          FROM house_review r
          LEFT JOIN "user" u
            ON u.id = r.user_id
          LEFT JOIN house_listing h
            ON h.id = r.house_id
          ORDER BY r.created_at DESC
          LIMIT 500
        `)
        .all(),
      roommateDb.prepare(`
        SELECT r.id, r.house_id, r.reporter_user_id, r.category, r.details, r.status, r.created_at,
          h.name AS house_name, h.location,
          COALESCE(u.name, 'Student') AS reporter_name
        FROM house_listing_report r
        LEFT JOIN house_listing h ON h.id = r.house_id
        LEFT JOIN "user" u ON u.id = r.reporter_user_id
        ORDER BY CASE r.status WHEN 'open' THEN 0 ELSE 1 END, r.created_at DESC
        LIMIT 500
      `).all(),
      roommateDb.prepare('SELECT COUNT(*) AS count FROM "user"').get() as Promise<{ count: number }>,
    ]);

    const houseControls = new Map(
      (
        controls as {
          house_id: string;
          is_hidden: number;
          is_featured: number;
        }[]
      ).map((item) => [item.house_id, item]),
    );
    return Response.json({
      users,
      totalUsers: Number(userCount.count),
      reports,
      reviews,
      openReports: Number(openReports.count),
      roommateProfiles: Number(roommates.count),

      houses: listings.map((house) => ({
        id: house.id,
        name: house.name,
        location: house.location,
        county: house.county,
        price: house.price,
        deposit: house.deposit ?? 0,
        monthlyBills: house.monthlyBills ?? 0,
        type: house.type,
        rooms: house.rooms,
        available: house.available,
        description: house.description,
        amenities: house.amenities,
        distance: house.distance,
        coordinates: house.coordinates,
        locationUrl: house.locationUrl ?? null,
        furnishing: house.furnishing ?? "",
        contactMethods: house.contactMethods ?? [],

        hidden: Boolean(
          houseControls.get(house.id)?.is_hidden,
        ),

        featured: houseControls.has(house.id)
          ? Boolean(
              houseControls.get(house.id)?.is_featured,
            )
          : house.featured,
        ownerUserId: house.ownerUserId ?? null,
        verificationStatus: house.verificationStatus ?? "unverified",
        ownerName: house.ownerName ?? null,
        ownerMemberSince: house.ownerMemberSince ?? null,
        ownerListingCount: house.ownerListingCount ?? 0,
        contactPhone: house.contactPhone ?? "",
      })),
      houseReports,

      loadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin data error:", error);

    return Response.json(
      { error: "Could not load platform controls." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) {
      return Response.json(
        { error: "Request origin is not allowed." },
        { status: 403 },
      );
    }

    const user = await authorized(request);

    if (!user) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }

    if (
      Number(request.headers.get("content-length") ?? 0) > 12000
    ) {
      return Response.json(
        { error: "Listing data is too large." },
        { status: 413 },
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid listing data." },
        { status: 400 },
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const county =
      typeof body.county === "string"
        ? body.county.trim()
        : "";

    const distance =
      typeof body.distance === "string"
        ? body.distance.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const rooms =
      typeof body.rooms === "string"
        ? body.rooms.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const price = Number(body.price);
    const deposit = Number(body.deposit ?? 0);
    const monthlyBills = Number(body.monthlyBills ?? 0);
    const available = Number(body.available);
    const lat = Number(body.lat);
    const lon = Number(body.lon);

    const amenities =
      Array.isArray(body.amenities)
        ? body.amenities
            .filter(
              (value): value is string =>
                typeof value === "string",
            )
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 20)
        : typeof body.amenities === "string"
          ? body.amenities
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
              .slice(0, 20)
          : [];

    if (
      name.length < 3 ||
      name.length > 100 ||
      location.length < 2 ||
      location.length > 120 ||
      !isKenyanCounty(county) ||
      distance.length > 100 ||
      !houseTypes.includes(
        type as (typeof houseTypes)[number],
      ) ||
      rooms.length < 1 ||
      rooms.length > 60 ||
      description.length < 20 ||
      description.length > 2000 ||
      !Number.isInteger(price) ||
      price < 500 ||
      price > 1000000 ||
      !Number.isInteger(deposit) ||
      deposit < 0 ||
      deposit > 1000000 ||
      !Number.isInteger(monthlyBills) ||
      monthlyBills < 0 ||
      monthlyBills > 1000000 ||
      !Number.isInteger(available) ||
      available < 0 ||
      available > 1000 ||
      !Number.isFinite(lat) ||
      lat < -5 ||
      lat > 6 ||
      !Number.isFinite(lon) ||
      lon < 33 ||
      lon > 42 ||
      amenities.some((value) => value.length > 100)
    ) {
      return Response.json(
        {
          error:
            "Check the listing fields. Add a Kenyan map point and valid rent, availability and details.",
        },
        { status: 400 },
      );
    }

    await ensureFeatureTables();

    const id = crypto.randomUUID();

    await roommateDb
      .prepare(`
        INSERT INTO house_listing (
          id,
          name,
          location,
          county,
          distance,
          price,
          type,
          rooms,
          available,
          rating,
          featured,
          accent,
          description,
          amenities,
          lat,
          lon,
          deposit,
          monthly_bills
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', 0, 'light',
          ?, ?, ?, ?, ?, ?
        )
      `)
      .run(
        id,
        name,
        location,
        county,
        distance || "Student-friendly location",
        price,
        type,
        rooms,
        available,
        description,
        JSON.stringify(amenities),
        lat,
        lon,
        deposit,
        monthlyBills,
      );

    try {
      await notifySavedSearchesForHouse({
        id,
        name,
        county,
        location,
        type,
        price,
        monthlyBills,
      });
    } catch (notificationError) {
      console.error("Saved search notifications failed:", notificationError);
    }

    return Response.json(
      { success: true, id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin listing create error:", error);

    return Response.json(
      { error: "The new listing could not be saved." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSameOriginMutation(request)) {
      return Response.json(
        { error: "Request origin is not allowed." },
        { status: 403 },
      );
    }

    const user = await authorized(request);

    if (!user) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }

    const length = Number(
      request.headers.get("content-length") ?? 0,
    );

    if (length > 12000) {
      return Response.json(
        { error: "Invalid request." },
        { status: 413 },
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request." },
        { status: 400 },
      );
    }

    await ensureFeatureTables();

    const action =
      typeof body.action === "string"
        ? body.action
        : "";

    if (
      action === "review-hide" ||
      action === "review-unhide"
    ) {
      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      if (!id || id.length > 100) {
        return Response.json(
          { error: "Choose a valid review." },
          { status: 400 },
        );
      }

      const review = await roommateDb
        .prepare(`
          SELECT id
          FROM house_review
          WHERE id = ?
          LIMIT 1
        `)
        .get(id);

      if (!review) {
        return Response.json(
          { error: "Review not found." },
          { status: 404 },
        );
      }

      const status =
        action === "review-hide"
          ? "hidden"
          : "visible";

      await roommateDb
        .prepare(`
          UPDATE house_review
          SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .run(status, id);

      return Response.json({
        success: true,
        status,
      });
    }

    if (action === "review-delete") {
      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      if (!id || id.length > 100) {
        return Response.json(
          { error: "Choose a valid review." },
          { status: 400 },
        );
      }

      const result = await roommateDb
        .prepare(`
          DELETE FROM house_review
          WHERE id = ?
        `)
        .run(id);

      if (Number(result.rowsAffected ?? 0) !== 1) {
        return Response.json(
          { error: "Review not found." },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        id,
      });
    }

    if (action === "report-status") {
      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      const status =
        body.status === "resolved" ||
        body.status === "dismissed"
          ? body.status
          : "";

      if (!id || id.length > 100 || !status) {
        return Response.json(
          { error: "Choose a valid report update." },
          { status: 400 },
        );
      }

      const result = await roommateDb
        .prepare(
          "UPDATE moderation_report SET status = ? WHERE id = ?",
        )
        .run(status, id);

      if (Number(result.rowsAffected ?? 0) !== 1) {
        return Response.json(
          { error: "Report not found." },
          { status: 404 },
        );
      }

      return Response.json({ success: true });
    }

    if (action === "house-report-status") {
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const status = body.status === "resolved" || body.status === "dismissed" ? body.status : "";
      if (!id || !status) return Response.json({ error: "Choose a valid listing report update." }, { status: 400 });
      const result = await roommateDb.prepare("UPDATE house_listing_report SET status = ? WHERE id = ?").run(status, id);
      if (Number(result.rowsAffected ?? 0) !== 1) return Response.json({ error: "Listing report not found." }, { status: 404 });
      return Response.json({ success: true });
    }

    if (action === "user-suspend" || action === "user-unsuspend") {
      const targetId = typeof body.id === "string" ? body.id.trim() : "";
      if (!targetId || targetId.length > 100) return Response.json({ error: "Choose a valid account." }, { status: 400 });
      const target = await roommateDb.prepare('SELECT id, username FROM "user" WHERE id = ? LIMIT 1').get(targetId) as { id: string; username: string } | undefined;
      if (!target) return Response.json({ error: "Account not found." }, { status: 404 });
      if (target.username === "reflex001" || await isSuperAdminUserId(target.id)) {
        return Response.json({ error: "The protected administrator account cannot be suspended." }, { status: 403 });
      }
      const suspended = action === "user-suspend";
      await roommateDb.prepare('UPDATE "user" SET is_suspended = ? WHERE id = ?').run(suspended ? 1 : 0, targetId);
      if (suspended) await roommateDb.prepare('DELETE FROM "session" WHERE "userId" = ?').run(targetId);
      await recordAdminAction(user.id, suspended ? "user_suspended" : "user_unsuspended", targetId);
      return Response.json({ success: true, status: suspended ? "suspended" : "active" });
    }

    if (action === "user-verify" || action === "user-unverify") {
      const targetId = typeof body.id === "string" ? body.id.trim() : "";
      if (!targetId || targetId.length > 100) return Response.json({ error: "Choose a valid account." }, { status: 400 });
      const target = await roommateDb.prepare('SELECT id FROM "user" WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1').get(targetId) as { id: string } | undefined;
      if (!target) return Response.json({ error: "Account not found." }, { status: 404 });
      const verified = action === "user-verify";
      await roommateDb.prepare('UPDATE "user" SET is_verified = ? WHERE id = ?').run(verified ? 1 : 0, targetId);
      await recordAdminAction(user.id, verified ? "user_verified" : "user_unverified", targetId);
      return Response.json({ success: true, verified });
    }

    if (action === "user-rename") {
      const targetId = typeof body.id === "string" ? body.id.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!targetId || targetId.length > 100 || name.length < 2 || name.length > 100) return Response.json({ error: "Enter a valid display name." }, { status: 400 });
      const target = await roommateDb.prepare('SELECT id, username FROM "user" WHERE id = ? LIMIT 1').get(targetId) as { id: string; username: string } | undefined;
      if (!target) return Response.json({ error: "Account not found." }, { status: 404 });
      if (target.username === "reflex001" || await isSuperAdminUserId(target.id)) return Response.json({ error: "The protected administrator account cannot be edited here." }, { status: 403 });
      await roommateDb.prepare('UPDATE "user" SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(name, targetId);
      await recordAdminAction(user.id, "user_name_updated", targetId);
      return Response.json({ success: true });
    }

    if (action === "user-delete") {
      const targetId = typeof body.id === "string" ? body.id.trim() : "";
      if (!targetId || targetId.length > 100) return Response.json({ error: "Choose a valid account." }, { status: 400 });
      const target = await roommateDb.prepare('SELECT id, username FROM "user" WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1').get(targetId) as { id: string; username: string } | undefined;
      if (!target) return Response.json({ error: "Account not found." }, { status: 404 });
      if (target.username === "reflex001" || await isSuperAdminUserId(target.id)) return Response.json({ error: "The protected administrator account cannot be deleted." }, { status: 403 });
      const tombstone = `deleted-${targetId.slice(0, 24)}-${randomUUID().slice(0, 8)}`;
      await roommateDb.prepare('UPDATE "user" SET is_deleted = 1, is_suspended = 1, name = ?, username = ?, email = ?, emailVerified = 0, image = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run("Deleted account", tombstone, `${tombstone}@deleted.invalid`, targetId);
      await roommateDb.prepare('DELETE FROM "session" WHERE "userId" = ?').run(targetId);
      await roommateDb.prepare('DELETE FROM "account" WHERE "userId" = ?').run(targetId);
      await roommateDb.prepare("DELETE FROM roommate_profile WHERE user_id = ?").run(targetId);
      await recordAdminAction(user.id, "user_anonymized_deleted", targetId, "Listings and stable owner ID retained.");
      return Response.json({ success: true, status: "deleted", listingOwnershipPreserved: true });
    }

    if (action === "roommate-profile-hide" || action === "roommate-profile-unhide") {
      const profileId = typeof body.id === "string" ? body.id.trim() : "";
      if (!profileId || profileId.length > 100) return Response.json({ error: "Choose a valid roommate profile." }, { status: 400 });
      const target = await roommateDb.prepare(`
        SELECT rp.id, rp.user_id, rp.is_hidden, u.username
        FROM roommate_profile rp JOIN "user" u ON u.id = rp.user_id
        WHERE rp.id = ? LIMIT 1
      `).get(profileId) as { id: string; user_id: string; is_hidden: number; username: string } | undefined;
      if (!target) return Response.json({ error: "Roommate profile not found." }, { status: 404 });
      const hidden = action === "roommate-profile-hide";
      await roommateDb.prepare("UPDATE roommate_profile SET is_hidden = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(hidden ? 1 : 0, profileId);
      await recordAdminAction(user.id, hidden ? "roommate_profile_hidden" : "roommate_profile_unhidden", target.user_id, profileId);
      return Response.json({ success: true, visibility: hidden ? "hidden" : "visible" });
    }

    if (action === "roommate-profile-verify" || action === "roommate-profile-unverify") {
      const profileId = typeof body.id === "string" ? body.id.trim() : "";
      if (!profileId || profileId.length > 100) return Response.json({ error: "Choose a valid roommate profile." }, { status: 400 });
      const target = await roommateDb.prepare("SELECT id, user_id FROM roommate_profile WHERE id = ? LIMIT 1").get(profileId) as { id: string; user_id: string } | undefined;
      if (!target) return Response.json({ error: "Roommate profile not found." }, { status: 404 });
      const verified = action === "roommate-profile-verify";
      await roommateDb.prepare("UPDATE roommate_profile SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(verified ? 1 : 0, profileId);
      await recordAdminAction(user.id, verified ? "roommate_profile_verified" : "roommate_profile_unverified", target.user_id, profileId);
      return Response.json({ success: true, verified });
    }

    if (action === "roommate-profile-update") {
      const profileId = typeof body.id === "string" ? body.id.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const location = typeof body.location === "string" ? body.location.trim() : "";
      const about = typeof body.about === "string" ? body.about.trim() : "";
      if (!profileId || profileId.length > 100 || name.length < 2 || name.length > 100 || location.length < 2 || location.length > 120 || about.length > 2000) return Response.json({ error: "Check the roommate profile name, location and about text." }, { status: 400 });
      const target = await roommateDb.prepare("SELECT user_id FROM roommate_profile WHERE id = ? LIMIT 1").get(profileId) as { user_id: string } | undefined;
      if (!target) return Response.json({ error: "Roommate profile not found." }, { status: 404 });
      await roommateDb.prepare("UPDATE roommate_profile SET name = ?, location = ?, about = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, location, about, profileId);
      await recordAdminAction(user.id, "roommate_profile_updated", target.user_id, profileId);
      return Response.json({ success: true });
    }

    if (action === "remove-roommate-profile") {
      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      if (!id || id.length > 100) {
        return Response.json(
          { error: "Choose a valid profile." },
          { status: 400 },
        );
      }

      const target = await roommateDb.prepare(`
        SELECT u.id AS user_id, u.username
        FROM roommate_profile rp
        JOIN "user" u ON u.id = rp.user_id
        WHERE rp.id = ? LIMIT 1
      `).get(id) as { user_id: string; username: string } | undefined;
      if (!target) return Response.json({ error: "Profile not found." }, { status: 404 });
      if (target.username === "reflex001" || await isSuperAdminUserId(target.user_id)) {
        return Response.json({ error: "The administrator profile is protected." }, { status: 403 });
      }

      const result = await roommateDb
        .prepare(
          "DELETE FROM roommate_profile WHERE id = ?",
        )
        .run(id);

      if (Number(result.rowsAffected ?? 0) !== 1) {
        return Response.json(
          { error: "Profile not found." },
          { status: 404 },
        );
      }

      await recordAdminAction(user.id, "roommate_profile_deleted", target.user_id, id);

      return Response.json({ success: true });
    }

    if (action === "house-update") {
      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      const name =
        typeof body.name === "string"
          ? body.name.trim()
          : "";

      const location =
        typeof body.location === "string"
          ? body.location.trim()
          : "";

      const county =
        typeof body.county === "string"
          ? body.county.trim()
          : "";

      const distance =
        typeof body.distance === "string"
          ? body.distance.trim()
          : "";

      const type =
        typeof body.type === "string"
          ? body.type.trim()
          : "";

      const rooms =
        typeof body.rooms === "string"
          ? body.rooms.trim()
          : "";

      const description =
        typeof body.description === "string"
          ? body.description.trim()
          : "";

      const price = Number(body.price);
      const deposit = Number(body.deposit ?? 0);
      const monthlyBills = Number(body.monthlyBills ?? 0);
      const available = Number(body.available);
      const lat = Number(body.lat);
      const lon = Number(body.lon);
      const missingLat = body.lat === undefined || body.lat === null || body.lat === "";
      const missingLon = body.lon === undefined || body.lon === null || body.lon === "";
      const coordinatesProvided = !missingLat && !missingLon;
      const coordinatesPartial = missingLat !== missingLon;

      const amenities =
        Array.isArray(body.amenities)
          ? body.amenities
              .filter(
                (value): value is string =>
                  typeof value === "string",
              )
              .map((value) => value.trim())
              .filter(Boolean)
              .slice(0, 20)
          : typeof body.amenities === "string"
            ? body.amenities
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
                .slice(0, 20)
            : [];

      if (
        !id ||
        id.length > 100 ||
        name.length < 3 ||
        name.length > 100 ||
        location.length < 2 ||
        location.length > 120 ||
        !isKenyanCounty(county) ||
        distance.length > 100 ||
        type.length < 2 || type.length > 60 ||
        rooms.length < 1 ||
        rooms.length > 60 ||
        description.length < 20 ||
        description.length > 2000 ||
        !Number.isInteger(price) ||
        price < 500 ||
        price > 1000000 ||
        !Number.isInteger(deposit) ||
        deposit < 0 ||
        deposit > 1000000 ||
        !Number.isInteger(monthlyBills) ||
        monthlyBills < 0 ||
        monthlyBills > 1000000 ||
        !Number.isInteger(available) ||
        available < 0 ||
        available > 1000 ||
        coordinatesPartial ||
        (coordinatesProvided && (!Number.isFinite(lat) || lat < -5 || lat > 6 || !Number.isFinite(lon) || lon < 33 || lon > 42)) ||
        amenities.some((value) => value.length > 100)
      ) {
        return Response.json(
          {
            error:
              "Check the listing fields and map point.",
          },
          { status: 400 },
        );
      }

      const result = await roommateDb
        .prepare(`
          UPDATE house_listing
          SET
            name = ?,
            location = ?,
            county = ?,
            distance = ?,
            price = ?,
            deposit = ?,
            monthly_bills = ?,
            type = ?,
            rooms = ?,
            available = ?,
            description = ?,
            amenities = ?,
            lat = CASE WHEN ? = 1 THEN ? ELSE lat END,
            lon = CASE WHEN ? = 1 THEN ? ELSE lon END,
            has_coordinates = CASE WHEN ? = 1 THEN 1 ELSE has_coordinates END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .run(
          name,
          location,
          county,
          distance || "Student-friendly location",
          price,
          deposit,
          monthlyBills,
          type,
          rooms,
          available,
          description,
          JSON.stringify(amenities),
          coordinatesProvided ? 1 : 0,
          lat,
          coordinatesProvided ? 1 : 0,
          lon,
          coordinatesProvided ? 1 : 0,
          id,
        );

      if (Number(result.rowsAffected ?? 0) !== 1) {
        return Response.json(
          { error: "Listing not found." },
          { status: 404 },
        );
      }

      return Response.json({ success: true });
    }

    if (action === "house-control") {
      const houseId =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      const house = await roommateDb
        .prepare(`
          SELECT id
          FROM house_listing
          WHERE id = ?
          LIMIT 1
        `)
        .get(houseId);

      if (
        !house ||
        typeof body.hidden !== "boolean" ||
        typeof body.featured !== "boolean"
      ) {
        return Response.json(
          { error: "Choose a valid house update." },
          { status: 400 },
        );
      }

      await roommateDb
        .prepare(`
          INSERT INTO house_control (
            house_id,
            is_hidden,
            is_featured,
            updated_at
          )
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(house_id)
          DO UPDATE SET
            is_hidden = excluded.is_hidden,
            is_featured = excluded.is_featured,
            updated_at = CURRENT_TIMESTAMP
        `)
        .run(
          houseId,
          body.hidden ? 1 : 0,
          body.featured ? 1 : 0,
        );

      return Response.json({ success: true });
    }

    if (action === "house-status") {
      const houseId = typeof body.id === "string" ? body.id.trim() : "";
      const status = ["pending", "verified", "unverified", "under_review", "suspended"].includes(String(body.status)) ? String(body.status) : "";
      if (!houseId || !status) return Response.json({ error: "Choose a valid listing status." }, { status: 400 });
      const result = await roommateDb.prepare("UPDATE house_listing SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, houseId);
      if (Number(result.rowsAffected ?? 0) !== 1) return Response.json({ error: "Listing not found." }, { status: 404 });
      return Response.json({ success: true });
    }

    if (action === "house-delete") {
      const houseId =
        typeof body.id === "string"
          ? body.id.trim()
          : "";

      if (!houseId || houseId.length > 100) {
        return Response.json(
          { error: "Choose a valid house." },
          { status: 400 },
        );
      }

      const house = await roommateDb
        .prepare(`
          SELECT id
          FROM house_listing
          WHERE id = ?
          LIMIT 1
        `)
        .get(houseId);

      if (!house) {
        return Response.json(
          { error: "Listing not found." },
          { status: 404 },
        );
      }

      const images = await roommateDb
        .prepare(`
          SELECT
            id,
            blob_path
          FROM house_image
          WHERE house_id = ?
        `)
        .all() as {
          id: string;
          blob_path: string;
        }[];

      const blobPaths = images
        .map((image) => image.blob_path)
        .filter(
          (blobPath): blobPath is string =>
            typeof blobPath === "string" &&
            blobPath.trim().length > 0,
        );

      let blobCleanupFailures = 0;

      if (blobPaths.length > 0) {
        const cleanupResults = await Promise.allSettled(
          blobPaths.map((blobPath) => del(blobPath)),
        );

        blobCleanupFailures = cleanupResults.filter(
          (result) => result.status === "rejected",
        ).length;

        if (blobCleanupFailures > 0) {
          console.error(
            "Some house image blobs could not be deleted:",
            cleanupResults
              .filter(
                (
                  result,
                ): result is PromiseRejectedResult =>
                  result.status === "rejected",
              )
              .map((result) => result.reason),
          );
        }
      }

      await roommateDb
        .prepare(`
          DELETE FROM house_image
          WHERE house_id = ?
        `)
        .run(houseId);

      await roommateDb
        .prepare(`
          DELETE FROM house_review
          WHERE house_id = ?
        `)
        .run(houseId);

      await roommateDb
        .prepare(`
          DELETE FROM house_favorite
          WHERE house_id = ?
        `)
        .run(houseId);

      await roommateDb
        .prepare(`
          DELETE FROM house_control
          WHERE house_id = ?
        `)
        .run(houseId);

      const result = await roommateDb
        .prepare(`
          DELETE FROM house_listing
          WHERE id = ?
        `)
        .run(houseId);

      if (Number(result.rowsAffected ?? 0) !== 1) {
        return Response.json(
          { error: "Listing could not be deleted." },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        id: houseId,
        deletedImages: images.length,
        blobCleanupFailures,
      });
    }

    return Response.json(
      { error: "Unknown admin action." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Admin update error:", error);

    return Response.json(
      { error: "The platform update could not be saved." },
      { status: 500 },
    );
  }
}
