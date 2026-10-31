import { auth } from "@/auth";
import { roommateDb } from "@/lib/roommate-db";

type RequestRow = {
  id: string;
  sender_user_id: string;
  sender_profile_id: string;
  receiver_user_id: string;
  receiver_profile_id: string;
  status: string;
  created_at: string;
  sender_name: string;
  sender_username: string;
  sender_school: string;
  sender_location: string;
  sender_budget: number;
  receiver_name: string;
  receiver_username: string;
  receiver_school: string;
  receiver_location: string;
  receiver_budget: number;
};

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        {
          error: "You must be logged in to view connection requests.",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const incoming = roommateDb
      .prepare(
        `
          SELECT
            cr.id,
            cr.sender_user_id,
            cr.sender_profile_id,
            cr.receiver_user_id,
            cr.receiver_profile_id,
            cr.status,
            cr.created_at,
            sender.name AS sender_name,
            sender.username AS sender_username,
            sender.school AS sender_school,
            sender.location AS sender_location,
            sender.budget AS sender_budget,
            receiver.name AS receiver_name,
            receiver.username AS receiver_username,
            receiver.school AS receiver_school,
            receiver.location AS receiver_location,
            receiver.budget AS receiver_budget
          FROM connection_request cr
          INNER JOIN roommate_profile sender
            ON sender.id = cr.sender_profile_id
          INNER JOIN roommate_profile receiver
            ON receiver.id = cr.receiver_profile_id
          WHERE cr.receiver_user_id = ?
          ORDER BY cr.created_at DESC
        `,
      )
      .all(userId) as RequestRow[];

    const sent = roommateDb
      .prepare(
        `
          SELECT
            cr.id,
            cr.sender_user_id,
            cr.sender_profile_id,
            cr.receiver_user_id,
            cr.receiver_profile_id,
            cr.status,
            cr.created_at,
            sender.name AS sender_name,
            sender.username AS sender_username,
            sender.school AS sender_school,
            sender.location AS sender_location,
            sender.budget AS sender_budget,
            receiver.name AS receiver_name,
            receiver.username AS receiver_username,
            receiver.school AS receiver_school,
            receiver.location AS receiver_location,
            receiver.budget AS receiver_budget
          FROM connection_request cr
          INNER JOIN roommate_profile sender
            ON sender.id = cr.sender_profile_id
          INNER JOIN roommate_profile receiver
            ON receiver.id = cr.receiver_profile_id
          WHERE cr.sender_user_id = ?
          ORDER BY cr.created_at DESC
        `,
      )
      .all(userId) as RequestRow[];

    const connections = roommateDb
      .prepare(
        `
          SELECT
            cr.id,
            cr.sender_user_id,
            cr.sender_profile_id,
            cr.receiver_user_id,
            cr.receiver_profile_id,
            cr.status,
            cr.created_at,
            sender.name AS sender_name,
            sender.username AS sender_username,
            sender.school AS sender_school,
            sender.location AS sender_location,
            sender.budget AS sender_budget,
            receiver.name AS receiver_name,
            receiver.username AS receiver_username,
            receiver.school AS receiver_school,
            receiver.location AS receiver_location,
            receiver.budget AS receiver_budget
          FROM connection_request cr
          INNER JOIN roommate_profile sender
            ON sender.id = cr.sender_profile_id
          INNER JOIN roommate_profile receiver
            ON receiver.id = cr.receiver_profile_id
          WHERE
            cr.status = 'accepted'
            AND (
              cr.sender_user_id = ?
              OR cr.receiver_user_id = ?
            )
          ORDER BY cr.updated_at DESC
        `,
      )
      .all(userId, userId) as RequestRow[];

    const formatRequest = (item: RequestRow) => ({
      id: item.id,
      status: item.status,
      createdAt: item.created_at,
      sender: {
        id: item.sender_profile_id,
        name: item.sender_name,
        username: item.sender_username,
        school: item.sender_school,
        location: item.sender_location,
        budget: item.sender_budget,
      },
      receiver: {
        id: item.receiver_profile_id,
        name: item.receiver_name,
        username: item.receiver_username,
        school: item.receiver_school,
        location: item.receiver_location,
        budget: item.receiver_budget,
      },
    });

    const formattedConnections = connections.map((item) => {
      const isSender = item.sender_user_id === userId;
      const person = isSender
        ? {
            id: item.receiver_profile_id,
            name: item.receiver_name,
            username: item.receiver_username,
            school: item.receiver_school,
            location: item.receiver_location,
            budget: item.receiver_budget,
          }
        : {
            id: item.sender_profile_id,
            name: item.sender_name,
            username: item.sender_username,
            school: item.sender_school,
            location: item.sender_location,
            budget: item.sender_budget,
          };

      return {
        id: item.id,
        connectedAt: item.created_at,
        person,
      };
    });

    return Response.json({
      incoming: incoming.map(formatRequest),
      sent: sent.map(formatRequest),
      connections: formattedConnections,
    });
  } catch (error) {
    console.error("Connection requests error:", error);

    return Response.json(
      {
        error: "Something went wrong while loading your requests.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json(
        {
          error: "You must be logged in to manage connection requests.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const requestId = String(body.requestId ?? "").trim();
    const action = String(body.action ?? "").trim().toLowerCase();

    if (!requestId || !action) {
      return Response.json(
        {
          error: "Request ID and action are required.",
        },
        { status: 400 },
      );
    }

    if (action !== "accept" && action !== "decline") {
      return Response.json(
        {
          error: "Invalid request action.",
        },
        { status: 400 },
      );
    }

    const connectionRequest = roommateDb
      .prepare(
        `
          SELECT
            id,
            sender_user_id,
            receiver_user_id,
            status
          FROM connection_request
          WHERE id = ?
        `,
      )
      .get(requestId) as
      | {
          id: string;
          sender_user_id: string;
          receiver_user_id: string;
          status: string;
        }
      | undefined;

    if (!connectionRequest) {
      return Response.json(
        {
          error: "Connection request not found.",
        },
        { status: 404 },
      );
    }

    if (connectionRequest.receiver_user_id !== session.user.id) {
      return Response.json(
        {
          error: "You cannot manage this connection request.",
        },
        { status: 403 },
      );
    }

    if (connectionRequest.status !== "pending") {
      return Response.json(
        {
          error: "This connection request has already been handled.",
        },
        { status: 409 },
      );
    }

    const newStatus =
      action === "accept"
        ? "accepted"
        : "declined";

    roommateDb
      .prepare(
        `
          UPDATE connection_request
          SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
      )
      .run(newStatus, requestId);

    return Response.json({
      success: true,
      status: newStatus,
      message:
        action === "accept"
          ? "Connection request accepted."
          : "Connection request declined.",
    });
  } catch (error) {
    console.error("Connection request update error:", error);

    return Response.json(
      {
        error: "Something went wrong while updating the request.",
      },
      { status: 500 },
    );
  }
}