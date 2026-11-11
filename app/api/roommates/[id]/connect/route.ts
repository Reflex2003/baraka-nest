import { auth } from "@/lib/better-auth";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import {
  getRoommateProfileById,
  getRoommateProfileByUserId,
  getConnectionRequest,
  roommateDb,
} from "@/lib/roommate-db";

type ReceiverProfile = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  is_hidden: number;
};

type SenderProfile = {
  id: string;
  user_id: string;
  is_hidden: number;
};

type ExistingRequest = {
  status: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    await ensureFeatureTables();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        {
          error: "You must be logged in to connect with a roommate.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    const profileId = String(id ?? "").trim();

    if (!profileId || profileId.length > 100) {
      return Response.json(
        {
          error: "Invalid roommate profile.",
        },
        { status: 400 },
      );
    }

    const receiverProfile =
      (await getRoommateProfileById(profileId)) as ReceiverProfile | undefined;

    if (!receiverProfile) {
      return Response.json(
        {
          error: "Roommate profile not found.",
        },
        { status: 404 },
      );
    }

    if (Number(receiverProfile.is_hidden ?? 0) === 1) {
      return Response.json({ error: "Roommate profile not found." }, { status: 404 });
    }

    if (receiverProfile.user_id === session.user.id) {
      return Response.json(
        {
          error: "You cannot connect with your own profile.",
        },
        { status: 400 },
      );
    }

    const block = await roommateDb.prepare(`
      SELECT 1 FROM user_block
      WHERE (blocker_user_id = ? AND blocked_user_id = ?)
         OR (blocker_user_id = ? AND blocked_user_id = ?)
      LIMIT 1
    `).get(session.user.id, receiverProfile.user_id, receiverProfile.user_id, session.user.id);
    if (block) return Response.json({ error: "This connection is unavailable." }, { status: 403 });

    const senderProfile = await getRoommateProfileByUserId(session.user.id) as SenderProfile | undefined;

    if (!senderProfile) {
      return Response.json(
        {
          error: "You need to create a roommate profile first.",
        },
        { status: 400 },
      );
    }
    if (Number(senderProfile.is_hidden ?? 0) === 1) {
      return Response.json({ error: "Unhide your roommate profile before sending connection requests." }, { status: 403 });
    }

    const existingRequest = await getConnectionRequest(
      session.user.id,
      receiverProfile.user_id,
    ) as ExistingRequest | undefined;

    if (existingRequest) {
      return Response.json(
        {
          error:
            existingRequest.status === "accepted"
              ? "You are already connected with this student."
              : existingRequest.status === "pending"
                ? "A connection request already exists between you."
                : "A previous connection request already exists between you.",
          status: existingRequest.status,
        },
        { status: 409 },
      );
    }

    const connectionId = crypto.randomUUID();

    try {
      await roommateDb
        .prepare(
          `
            INSERT INTO connection_request (
              id,
              sender_user_id,
              sender_profile_id,
              receiver_user_id,
              receiver_profile_id,
              status
            )
            VALUES (
              @id,
              @senderUserId,
              @senderProfileId,
              @receiverUserId,
              @receiverProfileId,
              'pending'
            )
          `,
        )
        .run({
          id: connectionId,
          senderUserId: session.user.id,
          senderProfileId: senderProfile.id,
          receiverUserId: receiverProfile.user_id,
          receiverProfileId: receiverProfile.id,
        });
    } catch (insertError) {
      const message =
        insertError instanceof Error
          ? insertError.message
          : "";

      if (
        message.includes("UNIQUE") ||
        message.includes("unique") ||
        message.includes("constraint")
      ) {
        return Response.json(
          {
            error:
              "A connection request already exists between you.",
          },
          { status: 409 },
        );
      }

      throw insertError;
    }

    return Response.json(
      {
        success: true,
        message: `Connection request sent to ${receiverProfile.name}.`,
        id: connectionId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Connection request error:", error);

    return Response.json(
      {
        error:
          "Something went wrong while sending the connection request.",
      },
      { status: 500 },
    );
  }
}
