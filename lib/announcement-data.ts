import { ensureFeatureTables } from "@/lib/db";
import { roommateDb } from "@/lib/roommate-db";

export type AnnouncementAttachment = {
  id: string;
  announcement_id: string;
  url: string;
  file_name: string;
  content_type: string;
  size: number;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_published: number;
  attachments: AnnouncementAttachment[];
};

export async function getAnnouncements(publishedOnly = false): Promise<AnnouncementRow[]> {
  await ensureFeatureTables();
  const announcements = await roommateDb.prepare(`
    SELECT id, title, body, created_at, updated_at, is_published
    FROM announcement
    ${publishedOnly ? "WHERE is_published = 1" : ""}
    ORDER BY created_at DESC
    LIMIT 50
  `).all() as Omit<AnnouncementRow, "attachments">[];

  const attachments = await roommateDb.prepare(`
    SELECT id, announcement_id, url, file_name, content_type, size
    FROM announcement_attachment
    ORDER BY created_at ASC
  `).all() as AnnouncementAttachment[];
  const byAnnouncement = new Map<string, AnnouncementAttachment[]>();

  for (const attachment of attachments) {
    const group = byAnnouncement.get(attachment.announcement_id) ?? [];
    group.push(attachment);
    byAnnouncement.set(attachment.announcement_id, group);
  }

  return announcements.map((announcement) => ({
    ...announcement,
    attachments: byAnnouncement.get(announcement.id) ?? [],
  }));
}
