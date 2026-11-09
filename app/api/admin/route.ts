import { del } from "@vercel/blob";
import { auth } from "@/lib/better-auth";
import { isSameOriginMutation } from "@/lib/request-security";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import { getHouseListings } from "@/lib/house-records";
import { houseTypes } from "@/lib/house-types";
import { isKenyanCounty } from "@/lib/kenya-counties";
import { notifySavedSearchesForHouse } from "@/lib/house-alerts";

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

    const [
      users,
      reports,
      controls,
      roommates,
      openReports,
      listings,
      reviews,
    ] = await Promise.all([
      roommateDb
        .prepare(`
          SELECT
            u.id,
            u.name,
            u.email,
            u.createdAt,
            rp.id AS roommate_profile_id
          FROM "user" u
          LEFT JOIN roommate_profile rp
            ON rp.user_id = u.id
          WHERE COALESCE(u.username, '') <> 'reflex001'
          ORDER BY u.createdAt DESC
          LIMIT 250
        `)
        .all(),

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

        hidden: Boolean(
          houseControls.get(house.id)?.is_hidden,
        ),

        featured: houseControls.has(house.id)
          ? Boolean(
              houseControls.get(house.id)?.is_featured,
            )
          : house.featured,
      })),

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
            lat = ?,
            lon = ?,
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
          lat,
          lon,
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
