import { CompiledQuery } from "kysely";
import { db } from "@/lib/db";

function compile(statement: string, parameters: unknown[]) {
  if (
    parameters.length === 1 &&
    parameters[0] !== null &&
    typeof parameters[0] === "object" &&
    !Array.isArray(parameters[0])
  ) {
    const values: unknown[] = [];
    const sql = statement.replace(/@([A-Za-z][A-Za-z0-9_]*)/g, (_match, key: string) => {
      values.push((parameters[0] as Record<string, unknown>)[key]);
      return "?";
    });
    return CompiledQuery.raw(sql, values);
  }
  return CompiledQuery.raw(statement, parameters);
}

type QueryResult = {
  rows: Record<string, unknown>[];
  rowsAffected?: bigint;
  insertId?: bigint;
};

export const roommateDb = {
  prepare(statement: string) {
    return {
      async get(...parameters: unknown[]) {
        const result = await db.executeQuery(
          compile(statement, parameters),
        );
        return result.rows[0] as Record<string, unknown> | undefined;
      },
      async all(...parameters: unknown[]) {
        const result = await db.executeQuery(
          compile(statement, parameters),
        );
        return result.rows as Record<string, unknown>[];
      },
      async run(...parameters: unknown[]): Promise<QueryResult> {
        const result = await db.executeQuery(
          compile(statement, parameters),
        );
        return {
          rows: result.rows as Record<string, unknown>[],
          rowsAffected: result.numAffectedRows,
          insertId: result.insertId,
        };
      },
    };
  },
};

export async function getRoommateProfileByUserId(userId: string) {
  return roommateDb
    .prepare("SELECT * FROM roommate_profile WHERE user_id = ? LIMIT 1")
    .get(userId);
}

export async function getAllRoommateProfiles() {
  return roommateDb
    .prepare(`
      SELECT rp.*, u.image AS profile_image
      FROM roommate_profile rp
      LEFT JOIN "user" u ON u.id = rp.user_id
      ORDER BY rp.created_at DESC
    `)
    .all();
}

export async function getRoommateProfileById(id: string) {
  return roommateDb
    .prepare(`
      SELECT rp.*, u.image AS profile_image
      FROM roommate_profile rp
      LEFT JOIN "user" u ON u.id = rp.user_id
      WHERE rp.id = ? LIMIT 1
    `)
    .get(id);
}

export async function getConnectionRequest(
  senderUserId: string,
  receiverUserId: string,
) {
  return roommateDb
    .prepare(`
      SELECT * FROM connection_request
      WHERE (sender_user_id = ? AND receiver_user_id = ?)
         OR (sender_user_id = ? AND receiver_user_id = ?)
      ORDER BY created_at DESC LIMIT 1
    `)
    .get(senderUserId, receiverUserId, receiverUserId, senderUserId);
}

export async function createConnectionRequest(data: {
  id: string;
  senderUserId: string;
  senderProfileId: string;
  receiverUserId: string;
  receiverProfileId: string;
}) {
  const existing = await getConnectionRequest(
    data.senderUserId,
    data.receiverUserId,
  );
  if (existing) throw new Error("CONNECTION_ALREADY_EXISTS");

  return roommateDb.prepare(`
    INSERT INTO connection_request (
      id, sender_user_id, sender_profile_id, receiver_user_id,
      receiver_profile_id, status
    ) VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(
    data.id,
    data.senderUserId,
    data.senderProfileId,
    data.receiverUserId,
    data.receiverProfileId,
  );
}
