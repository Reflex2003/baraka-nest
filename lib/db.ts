import dns from "node:dns";
import { randomUUID } from "node:crypto";

import { LibsqlDialect } from "@libsql/kysely-libsql";
import { CompiledQuery, Kysely, sql } from "kysely";
import { houses } from "@/lib/houses";

dns.setDefaultResultOrder("ipv4first");

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error(
    "TURSO_DATABASE_URL must be configured before starting Baraka Nest.",
  );
}

if (
  process.env.NODE_ENV === "production" &&
  !/^libsql:\/\/|^https:\/\//i.test(databaseUrl)
) {
  throw new Error(
    "Production must use a remote Turso/libSQL HTTPS database URL.",
  );
}

if (process.env.NODE_ENV === "production" && !authToken) {
  throw new Error("TURSO_AUTH_TOKEN must be configured in production.");
}

export const dialect = new LibsqlDialect({
  url: databaseUrl,
  ...(authToken ? { authToken } : {}),
});

const globalForDatabase = globalThis as typeof globalThis & {
  barakaNestDb?: Kysely<Record<string, unknown>>;
};

export const db =
  globalForDatabase.barakaNestDb ??
  new Kysely<Record<string, unknown>>({ dialect });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.barakaNestDb = db;
}

export async function query<T extends Record<string, unknown>>(
  statement: string,
  parameters: readonly unknown[] = [],
) {
  const result = await db.executeQuery<T>(
    CompiledQuery.raw(statement, [...parameters]),
  );

  return result;
}

let userManagementSchema: Promise<void> | undefined;

async function ensureColumn(table: "user" | "roommate_profile", column: string) {
  const columns = await db.executeQuery(
    CompiledQuery.raw(`PRAGMA table_info("${table}")`, []),
  );
  if (columns.rows.some((row) => String((row as { name?: unknown }).name) === column)) return;

  try {
    if (table === "user" && column === "is_suspended") {
      await db.schema.alterTable("user").addColumn("is_suspended", "integer", (field) =>
        field.notNull().defaultTo(0),
      ).execute();
    } else if (table === "roommate_profile" && column === "is_hidden") {
      await db.schema.alterTable("roommate_profile").addColumn("is_hidden", "integer", (field) =>
        field.notNull().defaultTo(0),
      ).execute();
    }
  } catch (error) {
    // Parallel serverless instances can discover the same missing column.
    const refreshed = await db.executeQuery(
      CompiledQuery.raw(`PRAGMA table_info("${table}")`, []),
    );
    if (!refreshed.rows.some((row) => String((row as { name?: unknown }).name) === column)) throw error;
  }
}

/** Idempotent user-management schema changes and the one-time admin profile hide migration. */
export function ensureUserManagementSchema() {
  userManagementSchema ??= (async () => {
    await ensureColumn("user", "is_suspended");
    await ensureColumn("roommate_profile", "is_hidden");

    await db.schema.createTable("admin_action_log").ifNotExists()
      .addColumn("id", "text", (field) => field.primaryKey().notNull())
      .addColumn("admin_user_id", "text", (field) => field.notNull())
      .addColumn("action", "text", (field) => field.notNull())
      .addColumn("target_user_id", "text")
      .addColumn("target_profile_id", "text")
      .addColumn("created_at", "text", (field) => field.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    await db.schema.createTable("app_migration").ifNotExists()
      .addColumn("name", "text", (field) => field.primaryKey().notNull())
      .addColumn("applied_at", "text", (field) => field.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    try {
      await db.transaction().execute(async (transaction) => {
        const migration = await transaction.executeQuery(
          CompiledQuery.raw("SELECT name FROM app_migration WHERE name = ? LIMIT 1", ["hide-admin-roommate-profile-v1"]),
        );
        if (migration.rows.length) return;

        const profile = await transaction.executeQuery(
          CompiledQuery.raw(`
            SELECT rp.id, rp.user_id, rp.is_hidden
            FROM roommate_profile rp
            INNER JOIN "user" u ON u.id = rp.user_id
            WHERE u.username = ?
            LIMIT 1
          `, ["reflex001"]),
        );
        const target = profile.rows[0] as { id: string; user_id: string; is_hidden: number } | undefined;
        if (!target) return;

        if (Number(target.is_hidden) !== 1) {
          await transaction.executeQuery(
            CompiledQuery.raw("UPDATE roommate_profile SET is_hidden = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [target.id]),
          );
          await transaction.executeQuery(
            CompiledQuery.raw(`
              INSERT INTO admin_action_log (id, admin_user_id, action, target_user_id, target_profile_id)
              VALUES (?, ?, ?, ?, ?)
            `, [randomUUID(), target.user_id, "roommate_profile_hidden_migration", target.user_id, target.id]),
          );
        }
        await transaction.executeQuery(
          CompiledQuery.raw("INSERT INTO app_migration (name) VALUES (?)", ["hide-admin-roommate-profile-v1"]),
        );
      });
    } catch (error) {
      // If another instance applied the one-time migration, accept its result.
      const migration = await db.executeQuery(
        CompiledQuery.raw("SELECT name FROM app_migration WHERE name = ? LIMIT 1", ["hide-admin-roommate-profile-v1"]),
      );
      if (!migration.rows.length) throw error;
    }
  })().catch((error: unknown) => {
    userManagementSchema = undefined;
    throw error;
  });

  return userManagementSchema;
}

let featureSchema: Promise<void> | undefined;

export function ensureFeatureTables() {
  featureSchema ??= (async () => {
    // The sample listings are bootstrap data only. Checking whether the table
    // existed before this schema run prevents cold serverless instances from
    // restoring any listing an administrator has deleted.
    const existingHouseListingTable = await db.executeQuery(
      CompiledQuery.raw(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
        ["house_listing"],
      ),
    );
    const shouldSeedHouseListings = existingHouseListingTable.rows.length === 0;

    await db.schema
      .createTable("house_favorite")
      .ifNotExists()
      .addColumn("user_id", "text", (column) => column.notNull())
      .addColumn("house_id", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addPrimaryKeyConstraint("house_favorite_pk", [
        "user_id",
        "house_id",
      ])
      .execute();

    await db.schema
      .createTable("user_block")
      .ifNotExists()
      .addColumn("blocker_user_id", "text", (column) => column.notNull())
      .addColumn("blocked_user_id", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addPrimaryKeyConstraint("user_block_pk", [
        "blocker_user_id",
        "blocked_user_id",
      ])
      .execute();

    await db.schema
      .createTable("moderation_report")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("reporter_user_id", "text", (column) => column.notNull())
      .addColumn("reported_user_id", "text", (column) => column.notNull())
      .addColumn("category", "text", (column) => column.notNull())
      .addColumn("details", "text", (column) => column.notNull())
      .addColumn("status", "text", (column) =>
        column.notNull().defaultTo("open"),
      )
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createTable("message")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("conversation_key", "text", (column) => column.notNull())
      .addColumn("sender_user_id", "text", (column) => column.notNull())
      .addColumn("receiver_user_id", "text", (column) => column.notNull())
      .addColumn("body", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("read_at", "text")
      .execute();

    await db.schema
      .createTable("house_control")
      .ifNotExists()
      .addColumn("house_id", "text", (column) => column.primaryKey().notNull())
      .addColumn("is_hidden", "integer", (column) =>
        column.notNull().defaultTo(0),
      )
      .addColumn("is_featured", "integer", (column) =>
        column.notNull().defaultTo(0),
      )
      .addColumn("updated_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createTable("house_listing")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("name", "text", (column) => column.notNull())
      .addColumn("location", "text", (column) => column.notNull())
      .addColumn("county", "text", (column) => column.notNull())
      .addColumn("distance", "text", (column) => column.notNull())
      .addColumn("price", "integer", (column) => column.notNull())
      .addColumn("type", "text", (column) => column.notNull())
      .addColumn("rooms", "text", (column) => column.notNull())
      .addColumn("available", "integer", (column) => column.notNull())
      .addColumn("rating", "text", (column) =>
        column.notNull().defaultTo("New"),
      )
      .addColumn("featured", "integer", (column) =>
        column.notNull().defaultTo(0),
      )
      .addColumn("accent", "text", (column) =>
        column.notNull().defaultTo("light"),
      )
      .addColumn("description", "text", (column) => column.notNull())
      .addColumn("amenities", "text", (column) => column.notNull())
      .addColumn("lat", "real", (column) => column.notNull())
      .addColumn("lon", "real", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createTable("house_review")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("house_id", "text", (column) => column.notNull())
      .addColumn("user_id", "text", (column) => column.notNull())
      .addColumn("rating", "integer", (column) => column.notNull())
      .addColumn("comment", "text", (column) => column.notNull())
      .addColumn("status", "text", (column) =>
        column.notNull().defaultTo("visible"),
      )
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createIndex("house_review_house_idx")
      .ifNotExists()
      .on("house_review")
      .column("house_id")
      .execute();

    await db.schema
      .createIndex("house_review_user_house_idx")
      .ifNotExists()
      .on("house_review")
      .columns(["user_id", "house_id"])
      .execute();

    await db.schema
      .createTable("house_image")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("house_id", "text", (column) => column.notNull())
      .addColumn("url", "text", (column) => column.notNull())
      .addColumn("blob_path", "text", (column) => column.notNull())
      .addColumn("content_type", "text", (column) => column.notNull().defaultTo("image/jpeg"))
      .addColumn("size", "integer", (column) => column.notNull().defaultTo(0))
      .addColumn("sort_order", "integer", (column) =>
        column.notNull().defaultTo(0),
      )
      .addColumn("is_cover", "integer", (column) =>
        column.notNull().defaultTo(0),
      )
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    const houseColumns = await db.executeQuery(
      CompiledQuery.raw("PRAGMA table_info(house_listing)", []),
    );
    const existingHouseColumns = new Set(
      houseColumns.rows.map((row) => String((row as { name?: unknown }).name)),
    );
    for (const [name, type, defaultValue] of [
      ["owner_user_id", "text", null],
      ["verification_status", "text", "unverified"],
      ["contact_phone", "text", ""],
    ] as const) {
      if (!existingHouseColumns.has(name)) {
        try {
          await db.schema.alterTable("house_listing")
            .addColumn(name, type, (column) => defaultValue === null
              ? column
              : column.notNull().defaultTo(defaultValue))
            .execute();
        } catch (error) {
          const refreshed = await db.executeQuery(CompiledQuery.raw("PRAGMA table_info(house_listing)", []));
          if (!refreshed.rows.some((row) => String((row as { name?: unknown }).name) === name)) throw error;
        }
      }
    }

    const houseImageColumns = await db.executeQuery(
      CompiledQuery.raw("PRAGMA table_info(house_image)", []),
    );
    const existingHouseImageColumns = new Set(
      houseImageColumns.rows.map((row) => String((row as { name?: unknown }).name)),
    );
    if (!existingHouseImageColumns.has("content_type")) {
      try {
        await db.schema.alterTable("house_image")
          .addColumn("content_type", "text", (column) => column.notNull().defaultTo("image/jpeg"))
          .execute();
      } catch (error) {
        const refreshed = await db.executeQuery(CompiledQuery.raw("PRAGMA table_info(house_image)", []));
        if (!refreshed.rows.some((row) => String((row as { name?: unknown }).name) === "content_type")) throw error;
      }
    }
    if (!existingHouseImageColumns.has("size")) {
      try {
        await db.schema.alterTable("house_image")
          .addColumn("size", "integer", (column) => column.notNull().defaultTo(0))
          .execute();
      } catch (error) {
        const refreshed = await db.executeQuery(CompiledQuery.raw("PRAGMA table_info(house_image)", []));
        if (!refreshed.rows.some((row) => String((row as { name?: unknown }).name) === "size")) throw error;
      }
    }

    await db.schema.createTable("house_listing_report")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("house_id", "text", (column) => column.notNull())
      .addColumn("reporter_user_id", "text", (column) => column.notNull())
      .addColumn("category", "text", (column) => column.notNull())
      .addColumn("details", "text", (column) => column.notNull().defaultTo(""))
      .addColumn("status", "text", (column) => column.notNull().defaultTo("open"))
      .addColumn("created_at", "text", (column) => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();
    await db.schema.createIndex("house_listing_report_house_idx")
      .ifNotExists().on("house_listing_report").column("house_id").execute();

    await db.executeQuery(CompiledQuery.raw(`
      CREATE TRIGGER IF NOT EXISTS house_image_max_four
      BEFORE INSERT ON house_image
      WHEN (SELECT COUNT(*) FROM house_image WHERE house_id = NEW.house_id) >= 4
      BEGIN SELECT RAISE(ABORT, 'A listing can have a maximum of 4 media files.'); END
    `, []));

    await db.schema
      .createIndex("house_image_house_idx")
      .ifNotExists()
      .on("house_image")
      .column("house_id")
      .execute();

    await db.schema
      .createTable("house_saved_search")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("user_id", "text", (column) => column.notNull())
      .addColumn("label", "text", (column) => column.notNull())
      .addColumn("filters", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createIndex("house_saved_search_user_idx")
      .ifNotExists()
      .on("house_saved_search")
      .column("user_id")
      .execute();

    await db.schema
      .createTable("in_app_notification")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("user_id", "text", (column) => column.notNull())
      .addColumn("type", "text", (column) => column.notNull())
      .addColumn("title", "text", (column) => column.notNull())
      .addColumn("body", "text", (column) => column.notNull())
      .addColumn("href", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("read_at", "text")
      .execute();

    await db.schema
      .createIndex("in_app_notification_user_idx")
      .ifNotExists()
      .on("in_app_notification")
      .columns(["user_id", "created_at"])
      .execute();

    await db.schema
      .createTable("announcement")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("title", "text", (column) => column.notNull())
      .addColumn("body", "text", (column) => column.notNull().defaultTo(""))
      .addColumn("is_published", "integer", (column) => column.notNull().defaultTo(0))
      .addColumn("created_by", "text", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn("updated_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    const announcementColumns = await db.executeQuery(
      CompiledQuery.raw("PRAGMA table_info(announcement)", []),
    );
    const existingAnnouncementColumns = new Set(
      announcementColumns.rows.map((row) =>
        String((row as { name?: unknown }).name),
      ),
    );

    if (!existingAnnouncementColumns.has("is_published")) {
      try {
        await db.schema
          .alterTable("announcement")
          .addColumn("is_published", "integer", (column) =>
            column.notNull().defaultTo(0),
          )
          .execute();
      } catch (error) {
        // Multiple serverless instances can discover the missing column at once.
        const refreshedColumns = await db.executeQuery(
          CompiledQuery.raw("PRAGMA table_info(announcement)", []),
        );
        const columnExists = refreshedColumns.rows.some(
          (row) => String((row as { name?: unknown }).name) === "is_published",
        );
        if (!columnExists) throw error;
      }
    }

    await db.schema
      .createTable("announcement_attachment")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey().notNull())
      .addColumn("announcement_id", "text", (column) => column.notNull())
      .addColumn("url", "text", (column) => column.notNull())
      .addColumn("blob_path", "text", (column) => column.notNull())
      .addColumn("file_name", "text", (column) => column.notNull())
      .addColumn("content_type", "text", (column) => column.notNull())
      .addColumn("size", "integer", (column) => column.notNull())
      .addColumn("created_at", "text", (column) =>
        column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await db.schema
      .createIndex("announcement_attachment_announcement_idx")
      .ifNotExists()
      .on("announcement_attachment")
      .column("announcement_id")
      .execute();

    const listingColumns = await db.executeQuery(
      CompiledQuery.raw("PRAGMA table_info(house_listing)", []),
    );
    const existingListingColumns = new Set(
      listingColumns.rows.map((row) => String((row as { name?: unknown }).name)),
    );

    if (!existingListingColumns.has("deposit")) {
      await db.schema
        .alterTable("house_listing")
        .addColumn("deposit", "integer", (column) =>
          column.notNull().defaultTo(0),
        )
        .execute();
    }

    if (!existingListingColumns.has("monthly_bills")) {
      await db.schema
        .alterTable("house_listing")
        .addColumn("monthly_bills", "integer", (column) =>
          column.notNull().defaultTo(0),
        )
        .execute();
    }

    const roommateProfileColumns = await db.executeQuery(
      CompiledQuery.raw("PRAGMA table_info(roommate_profile)", []),
    );
    const existingRoommateProfileColumns = new Set(
      roommateProfileColumns.rows.map((row) => String((row as { name?: unknown }).name)),
    );
    if (!existingRoommateProfileColumns.has("gender")) {
      try {
        await db.schema
          .alterTable("roommate_profile")
          .addColumn("gender", "text", (column) => column.notNull().defaultTo(""))
          .execute();
      } catch (error) {
        const refreshedColumns = await db.executeQuery(
          CompiledQuery.raw("PRAGMA table_info(roommate_profile)", []),
        );
        const columnExists = refreshedColumns.rows.some(
          (row) => String((row as { name?: unknown }).name) === "gender",
        );
        if (!columnExists) throw error;
      }
    }

    await ensureUserManagementSchema();

    if (shouldSeedHouseListings) {
      for (const house of houses) {
        await db.executeQuery(
          CompiledQuery.raw(
            `
              INSERT OR IGNORE INTO house_listing (
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
                lon
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              house.id,
              house.name,
              house.location,
              house.county,
              house.distance,
              house.price,
              house.type,
              house.rooms,
              house.available,
              house.rating,
              house.featured ? 1 : 0,
              house.accent,
              house.description,
              JSON.stringify(house.amenities),
              house.coordinates.lat,
              house.coordinates.lon,
            ],
          ),
        );
      }
    }
  })().catch((error: unknown) => {
    featureSchema = undefined;
    throw error;
  });

  return featureSchema;
}
