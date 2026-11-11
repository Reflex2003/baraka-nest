import "server-only";
import { randomUUID } from "node:crypto";
import { roommateDb } from "@/lib/roommate-db";

/** Authorization is derived from the authenticated database user, never from client state. */
export async function isSuperAdminUserId(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const row = await roommateDb.prepare(
    'SELECT 1 AS allowed FROM "user" WHERE id = ? AND username = ? LIMIT 1',
  ).get(userId, "reflex001");
  return Boolean(row);
}

export async function recordAdminAction(
  adminUserId: string,
  action: string,
  targetUserId?: string | null,
  targetProfileId?: string | null,
) {
  await roommateDb.prepare(`
    INSERT INTO admin_action_log (id, admin_user_id, action, target_user_id, target_profile_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), adminUserId, action, targetUserId ?? null, targetProfileId ?? null);
}
