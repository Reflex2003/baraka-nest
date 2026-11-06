import "server-only";
import { roommateDb } from "@/lib/roommate-db";

/** Authorization is derived from the authenticated database user, never from client state. */
export async function isSuperAdminUserId(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const row = await roommateDb.prepare(
    'SELECT 1 AS allowed FROM "user" WHERE id = ? AND username = ? LIMIT 1',
  ).get(userId, "reflex001");
  return Boolean(row);
}
