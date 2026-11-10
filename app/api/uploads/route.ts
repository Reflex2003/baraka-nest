import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";

type UploadPayload = {
  kind?: "avatar" | "house-image" | "announcement-asset";
  userId?: string;
  houseId?: string;
  announcementId?: string;
};

function parsePayload(value: string | null): UploadPayload {
  if (!value) throw new Error("Upload details are missing.");
  try {
    return JSON.parse(value) as UploadPayload;
  } catch {
    throw new Error("Upload details are invalid.");
  }
}

export async function POST(request: Request) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    const hasReadWriteToken = Boolean(
      blobToken && !/^(your|replace|placeholder|paste)[_-]/i.test(blobToken),
    );
    if (!hasReadWriteToken) {
      return Response.json(
        { error: "Blob uploads need a BLOB_READ_WRITE_TOKEN. In Vercel, edit the Blob store connection and enable 'Add a read-write token env var', then save and redeploy." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) throw new Error("Sign in before uploading a file.");

        const payload = parsePayload(clientPayload);
        const safePath = pathname.replace(/\\/g, "/");

        if (payload.kind === "avatar") {
          if (payload.userId !== session.user.id || !safePath.startsWith(`user-avatars/${session.user.id}/`) || safePath.includes("..")) {
            throw new Error("That avatar upload path is not allowed.");
          }
          return {
            allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
            maximumSizeInBytes: 20 * 1024 * 1024,
            addRandomSuffix: false,
            tokenPayload: JSON.stringify({ kind: payload.kind, userId: session.user.id }),
          };
        }

        if (!(await isSuperAdminUserId(session.user.id))) {
          throw new Error("Only the admin can upload these files.");
        }

        await ensureFeatureTables();

        if (payload.kind === "house-image") {
          const houseId = typeof payload.houseId === "string" ? payload.houseId : "";
          const house = houseId
            ? await roommateDb.prepare("SELECT id, owner_user_id FROM house_listing WHERE id = ? LIMIT 1").get(houseId) as { id: string; owner_user_id: string | null } | undefined
            : null;
          const isAdmin = await isSuperAdminUserId(session.user.id);
          if (!house || (house.owner_user_id !== session.user.id && !isAdmin) || !safePath.startsWith(`houses/${houseId}/`) || safePath.includes("..")) {
            throw new Error("Choose a valid housing listing before uploading photos.");
          }
          const mediaCount = await roommateDb.prepare("SELECT COUNT(*) AS count FROM house_image WHERE house_id = ?").get(houseId) as { count: number };
          if (Number(mediaCount.count) >= 4) throw new Error("A house listing can have a maximum of 4 media files.");
          return {
            allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "video/mp4", "video/webm"],
            maximumSizeInBytes: 100 * 1024 * 1024,
            addRandomSuffix: false,
            tokenPayload: JSON.stringify({ kind: payload.kind, userId: session.user.id, houseId }),
          };
        }

        if (payload.kind === "announcement-asset") {
          const announcementId = typeof payload.announcementId === "string" ? payload.announcementId : "";
          const announcement = announcementId
            ? await roommateDb.prepare("SELECT id FROM announcement WHERE id = ? LIMIT 1").get(announcementId)
            : null;
          if (!announcement || !safePath.startsWith(`announcements/${announcementId}/`) || safePath.includes("..")) {
            throw new Error("Save the announcement before adding its files.");
          }
          return {
            maximumSizeInBytes: 250 * 1024 * 1024,
            addRandomSuffix: false,
            tokenPayload: JSON.stringify({ kind: payload.kind, userId: session.user.id, announcementId }),
          };
        }

        throw new Error("That upload type is not supported.");
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Client file upload authorization failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "This file could not be authorized for upload." },
      { status: 400 },
    );
  }
}
