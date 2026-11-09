"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadUserFile } from "@/lib/client-upload";

type AnnouncementFile = {
  id: string;
  url: string;
  file_name: string;
  content_type: string;
  size: number;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_published: number;
  attachments: AnnouncementFile[];
};

const panel = "rounded-3xl border border-[#e5ebe3] bg-white p-5 shadow-[0_10px_30px_rgba(24,59,44,0.04)] sm:p-6";
const button = "min-h-10 rounded-full border border-[#dce5db] px-4 text-xs font-bold text-[#355342] transition hover:bg-[#f3f6f1] disabled:opacity-50";
const maxFileSize = 250 * 1024 * 1024;

async function responseJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The announcement could not be saved.");
  return data;
}

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/announcements", { cache: "no-store", credentials: "include" });
      const data = await responseJson(response);
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements as Announcement[] : []);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Announcements could not be loaded.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  function resetForm() {
    setTitle("");
    setBody("");
    setFiles([]);
    setEditing(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function saveAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() && !body.trim() && files.length === 0) {
      setError("Add text or at least one file to publish an announcement.");
      return;
    }
    const announcementTitle = title.trim() || "Announcement";
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let id = editing?.id;
      if (editing) {
        await responseJson(await fetch(`/api/admin/announcements/${encodeURIComponent(editing.id)}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: announcementTitle, body }),
        }));
      } else {
        const created = await responseJson(await fetch("/api/admin/announcements", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: announcementTitle, body }),
        }));
        id = created.id as string;
        setEditing({
          id,
          title: announcementTitle,
          body,
          created_at: new Date().toISOString(),
          is_published: 0,
          attachments: [],
        });
      }

      for (const file of files) {
        const blob = await uploadUserFile(file, { kind: "announcement-asset", announcementId: id! });
        await responseJson(await fetch("/api/uploads/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "announcement-asset",
            announcementId: id,
            url: blob.url,
            pathname: blob.pathname,
            contentType: file.type || blob.contentType,
            size: file.size,
          }),
        }));
        setFiles((current) => current.filter((pending) => pending !== file));
      }

      await responseJson(await fetch(`/api/admin/announcements/${encodeURIComponent(id!)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: announcementTitle, body, publish: true }),
      }));
      setMessage(editing ? "Announcement updated." : "Announcement published.");
      resetForm();
      await refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "The announcement could not be saved.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteAnnouncement(announcement: Announcement) {
    if (!window.confirm(`Delete “${announcement.title}” and its attachments?`)) return;
    setBusy(true);
    setError("");
    try {
      await responseJson(await fetch(`/api/admin/announcements/${encodeURIComponent(announcement.id)}`, {
        method: "DELETE",
        credentials: "include",
      }));
      if (editing?.id === announcement.id) resetForm();
      setMessage("Announcement deleted.");
      await refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "The announcement could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAttachment(announcementId: string, file: AnnouncementFile) {
    setBusy(true);
    setError("");
    try {
      await responseJson(await fetch(`/api/admin/announcements/${encodeURIComponent(announcementId)}/attachments/${encodeURIComponent(file.id)}`, {
        method: "DELETE",
        credentials: "include",
      }));
      await refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "The file could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  function startEditing(announcement: Announcement) {
    setEditing(announcement);
    setTitle(announcement.title);
    setBody(announcement.body);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    document.getElementById("announcement-editor")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className={`${panel} mb-6`}>
      <div className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e58b45]">Homepage</p>
        <h2 className="mt-1 text-xl font-extrabold">Announcements</h2>
        <p className="mt-1 text-sm text-[#718077]">Publish updates with text and a mix of images, GIFs, videos, stickers, audio or other files. Up to 10 files, 250MB each.</p>
      </div>

      <form id="announcement-editor" onSubmit={saveAnnouncement} className="grid gap-3 rounded-2xl bg-[#f7f9f5] p-4">
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Announcement title (optional)" className="min-h-11 rounded-xl border border-[#dfe6dd] px-3 text-sm" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={3} placeholder="Write an update for students…" className="rounded-xl border border-[#dfe6dd] px-3 py-2 text-sm" />
        <div className="flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" multiple className="max-w-full text-xs" onChange={(event) => {
            const picked = Array.from(event.target.files ?? []);
            if (picked.length > 10 || picked.some((file) => file.size > maxFileSize)) {
              setError("Choose up to 10 files, each 250MB or smaller.");
              event.target.value = "";
              setFiles([]);
              return;
            }
            setError("");
            setFiles(picked);
          }} />
          <button disabled={busy} className="min-h-10 rounded-full bg-[#183b2c] px-5 text-xs font-bold text-white disabled:opacity-50">
            {busy ? "Saving…" : editing ? "Save changes" : "Publish announcement"}
          </button>
          {editing && <button type="button" disabled={busy} onClick={resetForm} className={button}>Cancel edit</button>}
        </div>
        {files.length > 0 && <p className="text-xs text-[#526258]">{files.map((file) => file.name).join(" · ")}</p>}
        {editing && editing.attachments.length > 0 && <p className="text-xs text-[#718077]">Existing files stay attached. Remove any from the published item below.</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-[#eaf2e8] px-3 py-2 text-xs font-semibold text-[#285640]">{message}</p>}
      </form>

      <div className="mt-6 space-y-4">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="rounded-2xl border border-[#e5ebe3] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[#183b2c]">{announcement.title}</h3>
                  {!announcement.is_published && <span className="rounded-full bg-[#fff1e7] px-2 py-1 text-[10px] font-bold text-[#9a5a28]">Draft</span>}
                </div>
                {announcement.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#647067]">{announcement.body}</p>}
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => startEditing(announcement)} className={button}>Edit</button>
                <button type="button" disabled={busy} onClick={() => void deleteAnnouncement(announcement)} className={`${button} text-red-700`}>Delete</button>
              </div>
            </div>
            {announcement.attachments.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {announcement.attachments.map((file) => (
                <div key={file.id} className="overflow-hidden rounded-xl border border-[#e5ebe3] bg-[#fafbf9]">
                  {file.content_type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt={file.file_name} className="aspect-video w-full object-cover" />
                  ) : file.content_type.startsWith("video/") ? (
                    <video src={file.url} controls className="aspect-video w-full bg-black" />
                  ) : file.content_type.startsWith("audio/") ? (
                    <div className="p-3"><audio src={file.url} controls className="w-full" /></div>
                  ) : (
                    <a href={file.url} target="_blank" rel="noreferrer" className="flex min-h-24 items-center justify-center p-4 text-center text-xs font-bold text-[#355342] underline">Download {file.file_name}</a>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]">
                    <span className="min-w-0 truncate text-[#718077]">{file.file_name}</span>
                    <button type="button" disabled={busy} onClick={() => void deleteAttachment(announcement.id, file)} className="shrink-0 font-bold text-red-700">Remove</button>
                  </div>
                </div>
              ))}
            </div>}
          </article>
        ))}
        {announcements.length === 0 && <p className="rounded-xl bg-[#f7f9f5] px-4 py-8 text-center text-sm text-[#718077]">No announcements yet.</p>}
      </div>
    </section>
  );
}
