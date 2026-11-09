# Baraka Nest

Baraka Nest is a student housing and roommate discovery app built with Next.js, Better Auth, Kysely, and Turso/libSQL.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET` (at least 32 random characters), and `BETTER_AUTH_URL`.
4. Create a Vercel Blob store and connect it to the project. For local development, use its `BLOB_READ_WRITE_TOKEN`, or link the project and pull its development variables with `vercel env pull .env.local` (Vercel OIDC also needs `BLOB_STORE_ID`).
5. Start the app with `npm run dev`.

Uploads use Vercel Blob client uploads. The store must be connected to this Vercel project. The app accepts a real `BLOB_READ_WRITE_TOKEN`, or Vercel OIDC credentials paired with `BLOB_STORE_ID`. After changing a Vercel environment variable or store connection, redeploy the affected deployment. Never commit `.env.local` or share credentials publicly. A placeholder such as `your-vercel-blob-read-write-token` cannot authorize uploads.

The app uses Turso for both authentication/session data and roommate profiles/connections. It fails early when the database URL or auth secret is missing.

Housing listings are stored in Turso and seeded idempotently with the original sample listings. A super-admin can add, edit, feature, hide, or remove listings from the unlinked `/nest-control-panel` route. Add accurate inventory and map coordinates before promoting the platform; the included listings are starter examples, not verified landlord submissions.

## Moving local SQLite data to Turso

The local `baraka-nest.db` is a backup and the migration source. It is intentionally ignored by Git for new files. To copy its tables into the configured Turso database, run:

```sh
npm run migrate:turso
```

The migration is repeatable: it creates missing tables, inserts missing rows, and checks every local row against Turso. It never deletes or modifies the SQLite backup. Keep the backup until the Turso data and sign-in/session flows have been checked.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Do not commit `.env.local`, Turso tokens, local database files, or production data.
