import { auth } from "@/auth";
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
};

type ExistingRequest = {
  status: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
      getRoommateProfileById(profileId) as ReceiverProfile | undefined;

    if (!receiverProfile) {
      return Response.json(
        {
          error: "Roommate profile not found.",
        },
        { status: 404 },
      );
    }

    if (receiverProfile.user_id === session.user.id) {
      return Response.json(
        {
          error: "You cannot connect with your own profile.",
        },
        { status: 400 },
      );
    }

    const senderProfile = getRoommateProfileByUserId(session.user.id);

    if (!senderProfile) {
      return Response.json(
        {
          error: "You need to create a roommate profile first.",
        },
        { status: 400 },
      );
    }

    const existingRequest = getConnectionRequest(
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
      roommateDb
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