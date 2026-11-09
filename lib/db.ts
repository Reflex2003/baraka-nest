import dns from "node:dns";

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

let featureSchema: Promise<void> | undefined;

export function ensureFeatureTables() {
  featureSchema ??= (async () => {
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
  })().catch((error: unknown) => {
    featureSchema = undefined;
    throw error;
  });

  return featureSchema;
}
