import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "baraka-nest.db");

export const roommateDb = new Database(dbPath);

roommateDb.pragma("journal_mode = WAL");

roommateDb.exec(`
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
`);

export function getRoommateProfileByUserId(userId: string) {
  return roommateDb
    .prepare(
      `
        SELECT *
        FROM roommate_profile
        WHERE user_id = ?
      `,
    )
    .get(userId) as
    | {
        id: string;
        user_id: string;
        username: string;
        name: string;
        age: number;
        school: string;
        location: string;
        budget: number;
        move_in: string;
        preference: string;
        about: string;
        interests: string;
        lifestyle: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;
}

export function getAllRoommateProfiles() {
  return roommateDb
    .prepare(
      `
        SELECT *
        FROM roommate_profile
        ORDER BY created_at DESC
      `,
    )
    .all();
}

export function getRoommateProfileById(id: string) {
  return roommateDb
    .prepare(
      `
        SELECT *
        FROM roommate_profile
        WHERE id = ?
      `,
    )
    .get(id);
}