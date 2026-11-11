import { del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { ensureFeatureTables } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";
import { roommateDb } from "@/lib/roommate-db";
import { validateMediaFileMetadata } from "@/lib/listing-input.mjs";

type UploadRecord = {
  kind?: unknown;
  url?: unknown;
  pathname?: unknown;
  contentType?: unknown;
  size?: unknown;
  houseId?: unknown;
  announcementId?: unknown;
};

function getBlobPath(url: string, pathname: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    !/\.public\.blob\.vercel-storage\.com$/i.test(parsed.hostname) ||
    !pathname ||
    pathname.length > 500 ||
    pathname.includes("..")
  ) return null;

  const urlPath = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  return urlPath === pathname ? pathname : null;
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return Response.json({ error: "Sign in to save this upload." }, { status: 401 });

    const body = await request.json() as UploadRecord;
    const kind = typeof body.kind === "string" ? body.kind : "";
    const url = typeof body.url === "string" ? body.url : "";
    const pathname = typeof body.pathname === "string" ? body.pathname : "";
    const contentType = typeof body.contentType === "string" ? body.contentType.slice(0, 160) : "application/octet-stream";
    const size = Number(body.size);
    const blobPath = getBlobPath(url, pathname);

    if (!blobPath || !Number.isFinite(size) || size < 0) {
      return Response.json({ error: "The uploaded file details are invalid." }, { status: 400 });
    }

    await ensureFeatureTables();

    if (kind === "avatar") {
      if (!contentType.startsWith("image/") || !pathname.startsWith(`user-avatars/${session.user.id}/`)) {
        return Response.json({ error: "Choose an image for your profile." }, { status: 400 });
      }
      const current = await roommateDb.prepare('SELECT image FROM "user" WHERE id = ? LIMIT 1').get(session.user.id) as { image: string | null } | undefined;
      await roommateDb.prepare('UPDATE "user" SET image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(url, session.user.id);
      if (current?.image?.includes(".public.blob.vercel-storage.com/")) {
        try { await del(current.image); } catch (error) { console.error("Previous avatar cleanup failed:", error); }
      }
      return Response.json({ success: true, avatarUrl: url });
    }

    if (kind === "house-image") {
      const houseId = typeof body.houseId === "string" ? body.houseId : "";
      const fileName = decodeURIComponent(pathname.split("/").pop() ?? "");
      const media = validateMediaFileMetadata(fileName, contentType, size);
      if (!houseId || !pathname.startsWith(`houses/${houseId}/`) || !media.valid) {
        return Response.json({ error: "The housing photo details are invalid." }, { status: 400 });
      }
      const existing = await roommateDb.prepare("SELECT id, owner_user_id FROM house_listing WHERE id = ? LIMIT 1").get(houseId) as { id: string; owner_user_id: string | null } | undefined;
      if (!existing) return Response.json({ error: "Housing listing not found." }, { status: 404 });
      if (existing.owner_user_id !== session.user.id && !(await isSuperAdminUserId(session.user.id))) return Response.json({ error: "You can only add media to your own listing." }, { status: 403 });
      const duplicate = await roommateDb.prepare("SELECT id FROM house_image WHERE blob_path = ? LIMIT 1").get(blobPath);
      if (duplicate) return Response.json({ success: true, duplicate: true });

      const existingCount = await roommateDb.prepare("SELECT COUNT(*) AS count FROM house_image WHERE house_id = ?").get(houseId) as { count: number };
      if (Number(existingCount.count) >= 4) return Response.json({ error: "A house listing can have a maximum of 4 media files. Remove one before adding another." }, { status: 400 });

      const imageId = randomUUID();
      const next = await roommateDb.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS sort_order FROM house_image WHERE house_id = ?").get(houseId) as { sort_order: number };
      await roommateDb.prepare(`
        INSERT INTO house_image (id, house_id, url, blob_path, content_type, size, sort_order, is_cover)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(imageId, houseId, url, blobPath, media.contentType, size, next.sort_order, Number(existingCount.count) === 0 ? 1 : 0);
      return Response.json({ success: true, imageId });
    }

    if (!(await isSuperAdminUserId(session.user.id))) {
      return Response.json({ error: "Only the admin can save this upload." }, { status: 404 });
    }

    if (kind === "announcement-asset") {
      const announcementId = typeof body.announcementId === "string" ? body.announcementId : "";
      if (!announcementId || !pathname.startsWith(`announcements/${announcementId}/`)) {
        return Response.json({ error: "The announcement file details are invalid." }, { status: 400 });
      }
      const announcement = await roommateDb.prepare("SELECT id FROM announcement WHERE id = ? LIMIT 1").get(announcementId);
      if (!announcement) return Response.json({ error: "Announcement not found." }, { status: 404 });
      const duplicate = await roommateDb.prepare("SELECT id FROM announcement_attachment WHERE blob_path = ? LIMIT 1").get(blobPath);
      if (duplicate) return Response.json({ success: true, duplicate: true });
      const count = await roommateDb.prepare("SELECT COUNT(*) AS count FROM announcement_attachment WHERE announcement_id = ?").get(announcementId) as { count: number };
      if (Number(count.count) >= 10) return Response.json({ error: "An announcement can have up to 10 files." }, { status: 400 });

      const fileName = decodeURIComponent(pathname.split("/").pop() ?? "attachment").slice(0, 200);
      await roommateDb.prepare(`
        INSERT INTO announcement_attachment (id, announcement_id, url, blob_path, file_name, content_type, size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), announcementId, url, blobPath, fileName, contentType, size);
      return Response.json({ success: true });
    }

    return Response.json({ error: "That upload type is not supported." }, { status: 400 });
  } catch (error) {
    console.error("Uploaded file registration failed:", error);
    return Response.json({ error: "The uploaded file could not be saved." }, { status: 500 });
  }
}
