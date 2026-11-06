/* eslint @typescript-eslint/no-require-imports: off */
require("dotenv").config({ path: ".env.local" });

const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

const localDb = new Database("baraka-nest.db");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log("🚀 Starting Baraka Nest → Turso migration...\n");

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("Turso environment variables are missing.");
  }

  const tables = [
    {
      name: "user",
      create: `
        CREATE TABLE IF NOT EXISTS "user" (
          "id" text NOT NULL PRIMARY KEY,
          "name" text NOT NULL,
          "email" text NOT NULL UNIQUE,
          "emailVerified" integer NOT NULL,
          "image" text,
          "createdAt" date NOT NULL,
          "updatedAt" date NOT NULL,
          "username" text NOT NULL
        )
      `,
    },
    {
      name: "account",
      create: `
        CREATE TABLE IF NOT EXISTS "account" (
          "id" text NOT NULL PRIMARY KEY,
          "accountId" text NOT NULL,
          "providerId" text NOT NULL,
          "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
          "accessToken" text,
          "refreshToken" text,
          "idToken" text,
          "accessTokenExpiresAt" date,
          "refreshTokenExpiresAt" date,
          "scope" text,
          "password" text,
          "createdAt" date NOT NULL,
          "updatedAt" date NOT NULL
        )
      `,
    },
    {
      name: "session",
      create: `
        CREATE TABLE IF NOT EXISTS "session" (
          "id" text NOT NULL PRIMARY KEY,
          "expiresAt" date NOT NULL,
          "token" text NOT NULL UNIQUE,
          "createdAt" date NOT NULL,
          "updatedAt" date NOT NULL,
          "ipAddress" text,
          "userAgent" text,
          "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
        )
      `,
    },
    {
      name: "verification",
      create: `
        CREATE TABLE IF NOT EXISTS "verification" (
          "id" text NOT NULL PRIMARY KEY,
          "identifier" text NOT NULL,
          "value" text NOT NULL,
          "expiresAt" date NOT NULL,
          "createdAt" date NOT NULL,
          "updatedAt" date NOT NULL
        )
      `,
    },
    {
      name: "roommate_profile",
      create: `
        CREATE TABLE IF NOT EXISTS roommate_profile (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          school TEXT NOT NULL,
          location TEXT NOT NULL,
          budget INTEGER NOT NULL,
          move_in TEXT NOT NULL,
          preference TEXT NOT NULL,
          about TEXT NOT NULL,
          interests TEXT NOT NULL,
          lifestyle TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
    },
    {
      name: "connection_request",
      create: `
        CREATE TABLE IF NOT EXISTS connection_request (
          id TEXT PRIMARY KEY,
          sender_user_id TEXT NOT NULL,
          sender_profile_id TEXT NOT NULL,
          receiver_user_id TEXT NOT NULL,
          receiver_profile_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(sender_user_id, receiver_user_id)
        )
      `,
    },
  ];

  for (const table of tables) {
    console.log(`Creating table: ${table.name}`);
    await turso.execute(table.create);
  }

  console.log("\n📦 Copying data...\n");

  for (const table of tables) {
    const rows = localDb
      .prepare(`SELECT * FROM "${table.name}"`)
      .all();

    console.log(`${table.name}: ${rows.length} row(s)`);

    if (!rows.length) {
      continue;
    }

    const columns = Object.keys(rows[0]);

    const placeholders = columns.map(() => "?").join(", ");

    const sql = `
      INSERT OR IGNORE INTO "${table.name}"
      (${columns.map((column) => `"${column}"`).join(", ")})
      VALUES (${placeholders})
    `;

    for (const row of rows) {
      await turso.execute({
        sql,
        args: columns.map((column) => row[column]),
      });
    }
  }

  console.log("\n🔍 Verifying Turso...\n");

  for (const table of tables) {
    const result = await turso.execute(
      `SELECT COUNT(*) AS count FROM "${table.name}"`,
    );

    const localCount = localDb
      .prepare(`SELECT COUNT(*) AS count FROM "${table.name}"`)
      .get().count;
    const remoteCount = Number(result.rows[0].count);
    if (remoteCount < localCount) {
      throw new Error(
        `Verification failed for ${table.name}: local has ${localCount}, Turso has ${remoteCount}.`,
      );
    }

    const localRows = localDb
      .prepare(`SELECT * FROM "${table.name}"`)
      .all();
    for (const row of localRows) {
      const columns = Object.keys(row);
      const remoteRow = await turso.execute({
        sql: `SELECT ${columns.map((column) => `"${column}"`).join(", ")} FROM "${table.name}" WHERE "id" = ?`,
        args: [row.id],
      });
      if (!remoteRow.rows.length) {
        throw new Error(`Verification failed: a local ${table.name} record is missing from Turso.`);
      }
      const same = columns.every((column) => {
        const localValue = row[column];
        const remoteValue = remoteRow.rows[0][column];
        if (localValue == null || remoteValue == null) {
          return localValue == null && remoteValue == null;
        }
        return String(localValue) === String(remoteValue);
      });
      if (!same) {
        throw new Error(`Verification failed: a local ${table.name} record differs in Turso.`);
      }
    }

    console.log(
      `${table.name}: local ${localCount}, Turso ${remoteCount} row(s)`,
    );
  }

  console.log("\n✅ Migration completed successfully.");
  console.log("Local SQLite database was NOT modified.");
}

migrate()
  .catch((error) => {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    localDb.close();
  });
