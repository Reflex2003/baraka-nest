/* eslint @typescript-eslint/no-require-imports: off */
require("dotenv").config({ path: ".env.local" });

const dns = require("node:dns");
const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

dns.setDefaultResultOrder("ipv4first");

const localDb = new Database("baraka-nest.db");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = [
  {
    name: "user",
    create: `
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" INTEGER NOT NULL,
        "image" TEXT,
        "createdAt" DATE NOT NULL,
        "updatedAt" DATE NOT NULL,
        "username" TEXT NOT NULL,
        "is_suspended" INTEGER NOT NULL DEFAULT 0
      )
    `,
  },
  {
    name: "account",
    create: `
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL
          REFERENCES "user" ("id") ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" DATE,
        "refreshTokenExpiresAt" DATE,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" DATE NOT NULL,
        "updatedAt" DATE NOT NULL
      )
    `,
  },
  {
    name: "session",
    create: `
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "expiresAt" DATE NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "createdAt" DATE NOT NULL,
        "updatedAt" DATE NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL
          REFERENCES "user" ("id") ON DELETE CASCADE
      )
    `,
  },
  {
    name: "verification",
    create: `
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" DATE NOT NULL,
        "createdAt" DATE NOT NULL,
        "updatedAt" DATE NOT NULL
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
        is_hidden INTEGER NOT NULL DEFAULT 0,
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
  {
    name: "house_image",
    create: `
      CREATE TABLE IF NOT EXISTS house_image (
        id TEXT PRIMARY KEY,
        house_id TEXT NOT NULL,
        url TEXT NOT NULL,
        blob_path TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_cover INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (house_id)
          REFERENCES house_listing(id)
          ON DELETE CASCADE
      )
    `,
    indexes: [
      `
        CREATE INDEX IF NOT EXISTS idx_house_image_house_id
        ON house_image(house_id)
      `,
    ],
  },
];

function localTableExists(tableName) {
  const result = localDb
    .prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name = ?
        LIMIT 1
      `,
    )
    .get(tableName);

  return Boolean(result);
}

async function createRemoteTables() {
  console.log("🗄️ Creating/verifying Turso tables...\n");

  for (const table of tables) {
    console.log(`Creating table: ${table.name}`);
    await turso.execute(table.create);

    if (table.indexes) {
      for (const indexSql of table.indexes) {
        await turso.execute(indexSql);
      }
    }
  }
}

async function copyLocalData() {
  console.log("\n📦 Copying local SQLite data...\n");

  for (const table of tables) {
    if (!localTableExists(table.name)) {
      console.log(
        `${table.name}: local table does not exist — skipping local copy.`,
      );
      continue;
    }

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
}

async function verifyTurso() {
  console.log("\n🔍 Verifying Turso...\n");

  for (const table of tables) {
    const result = await turso.execute(
      `SELECT COUNT(*) AS count FROM "${table.name}"`,
    );

    const remoteCount = Number(result.rows[0]?.count ?? 0);

    if (!localTableExists(table.name)) {
      console.log(
        `${table.name}: local table missing, Turso ${remoteCount} row(s)`,
      );
      continue;
    }

    const localCount = localDb
      .prepare(`SELECT COUNT(*) AS count FROM "${table.name}"`)
      .get().count;

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
        sql: `
          SELECT ${columns.map((column) => `"${column}"`).join(", ")}
          FROM "${table.name}"
          WHERE "id" = ?
        `,
        args: [row.id],
      });

      if (!remoteRow.rows.length) {
        throw new Error(
          `Verification failed: a local ${table.name} record is missing from Turso.`,
        );
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
        throw new Error(
          `Verification failed: a local ${table.name} record differs in Turso.`,
        );
      }
    }

    console.log(
      `${table.name}: local ${localCount}, Turso ${remoteCount} row(s)`,
    );
  }
}

async function migrate() {
  console.log("🚀 Starting Baraka Nest → Turso migration...\n");

  if (
    !process.env.TURSO_DATABASE_URL ||
    !process.env.TURSO_AUTH_TOKEN
  ) {
    throw new Error(
      "Turso environment variables are missing.",
    );
  }

  await createRemoteTables();
  await copyLocalData();
  await verifyTurso();

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
