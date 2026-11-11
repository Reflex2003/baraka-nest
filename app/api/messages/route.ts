import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";
import { isSameOriginMutation } from "@/lib/request-security";

type Conversation = {
  user_id: string;
  profile_id: string;
  name: string;
  username: string;
  school: string;
  location: string;
  body?: string;
  created_at?: string;
  unread?: number;
};

function conversationKey(first: string, second: string) {
  return [first, second].sort().join("::");
}

async function isConnected(userId: string, otherUserId: string) {
  const relation = await roommateDb.prepare(`
    SELECT cr.id FROM connection_request cr
    JOIN roommate_profile sender ON sender.id = cr.sender_profile_id
    JOIN roommate_profile receiver ON receiver.id = cr.receiver_profile_id
    WHERE cr.status = 'accepted'
      AND COALESCE(sender.is_hidden, 0) = 0
      AND COALESCE(receiver.is_hidden, 0) = 0
      AND ((cr.sender_user_id = ? AND cr.receiver_user_id = ?)
        OR (cr.sender_user_id = ? AND cr.receiver_user_id = ?))
    LIMIT 1
  `).get(userId, otherUserId, otherUserId, userId);
  return Boolean(relation);
}

async function isBlocked(userId: string, otherUserId: string) {
  const block = await roommateDb.prepare(`
    SELECT 1 FROM user_block
    WHERE (blocker_user_id = ? AND blocked_user_id = ?)
       OR (blocker_user_id = ? AND blocked_user_id = ?)
    LIMIT 1
  `).get(userId, otherUserId, otherUserId, userId);
  return Boolean(block);
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to view messages." }, { status: 401 });
    await ensureFeatureTables();

    const userId = session.user.id;
    const url = new URL(request.url);
    const otherId = (url.searchParams.get("with") ?? "").trim();
    const raw = (await roommateDb.prepare(`
      SELECT
        CASE WHEN cr.sender_user_id = ? THEN cr.receiver_user_id ELSE cr.sender_user_id END AS user_id,
        CASE WHEN cr.sender_user_id = ? THEN receiver.id ELSE sender.id END AS profile_id,
        CASE WHEN cr.sender_user_id = ? THEN receiver.name ELSE sender.name END AS name,
        CASE WHEN cr.sender_user_id = ? THEN receiver.username ELSE sender.username END AS username,
        CASE WHEN cr.sender_user_id = ? THEN receiver.school ELSE sender.school END AS school,
        CASE WHEN cr.sender_user_id = ? THEN receiver.location ELSE sender.location END AS location
      FROM connection_request cr
      JOIN roommate_profile sender ON sender.id = cr.sender_profile_id
      JOIN roommate_profile receiver ON receiver.id = cr.receiver_profile_id
      WHERE cr.status = 'accepted'
        AND COALESCE(sender.is_hidden, 0) = 0
        AND COALESCE(receiver.is_hidden, 0) = 0
        AND (cr.sender_user_id = ? OR cr.receiver_user_id = ?)
        AND NOT EXISTS (
          SELECT 1 FROM user_block b
          WHERE (b.blocker_user_id = ? AND b.blocked_user_id = CASE WHEN cr.sender_user_id = ? THEN cr.receiver_user_id ELSE cr.sender_user_id END)
             OR (b.blocked_user_id = ? AND b.blocker_user_id = CASE WHEN cr.sender_user_id = ? THEN cr.receiver_user_id ELSE cr.sender_user_id END)
        )
      ORDER BY cr.updated_at DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId)) as unknown as Conversation[];

    const conversations = await Promise.all(raw.map(async (person) => {
      const key = conversationKey(userId, person.user_id);
      const latest = await roommateDb.prepare(`
        SELECT body, created_at FROM message
        WHERE conversation_key = ? ORDER BY created_at DESC LIMIT 1
      `).get(key) as { body?: string; created_at?: string } | undefined;
      const unread = await roommateDb.prepare(`
        SELECT COUNT(*) AS count FROM message
        WHERE conversation_key = ? AND receiver_user_id = ? AND read_at IS NULL
      `).get(key, userId) as { count: number };
      return { ...person, body: latest?.body, created_at: latest?.created_at, unread: Number(unread.count) };
    }));

    if (!otherId) return Response.json({ conversations, messages: [] });
    if (await isBlocked(userId, otherId)) {
      return Response.json({ error: "Messaging is unavailable for this connection." }, { status: 403 });
    }
    if (!await isConnected(userId, otherId)) {
      return Response.json({ error: "Messages are available after a connection is accepted." }, { status: 403 });
    }
    const activeConversation = conversations.find((person) => person.user_id === otherId);
    if (!activeConversation) return Response.json({ error: "Messaging is unavailable for this connection." }, { status: 403 });

    const key = conversationKey(userId, otherId);
    const messages = await roommateDb.prepare(`
      SELECT id, sender_user_id, receiver_user_id, body, created_at, read_at
      FROM message WHERE conversation_key = ? ORDER BY created_at ASC LIMIT 300
    `).all(key);
    await roommateDb.prepare(`
      UPDATE message SET read_at = CURRENT_TIMESTAMP
      WHERE conversation_key = ? AND receiver_user_id = ? AND read_at IS NULL
    `).run(key, userId);

    return Response.json({
      conversations,
      messages,
      active: activeConversation,
    });
  } catch (error) {
    console.error("Messages load error:", error);
    return Response.json({ error: "We could not load your messages right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to send a message." }, { status: 401 });
    await ensureFeatureTables();
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > 5000) return Response.json({ error: "Message is too large." }, { status: 413 });

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
      return Response.json({ error: "Invalid message." }, { status: 400 });
    }
    const receiverId = typeof body.receiverId === "string" ? body.receiverId.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!receiverId || receiverId.length > 100 || receiverId === session.user.id ||
      !message || message.length > 2000) {
      return Response.json({ error: "Enter a message of 1–2,000 characters." }, { status: 400 });
    }
    if (await isBlocked(session.user.id, receiverId)) {
      return Response.json({ error: "Messaging is unavailable for this connection." }, { status: 403 });
    }
    if (!await isConnected(session.user.id, receiverId)) {
      return Response.json({ error: "You can message students after they accept your connection." }, { status: 403 });
    }

    await roommateDb.prepare(`
      INSERT INTO message (id, conversation_key, sender_user_id, receiver_user_id, body)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), conversationKey(session.user.id, receiverId), session.user.id, receiverId, message);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return Response.json({ error: "We could not send your message right now." }, { status: 500 });
  }
}
