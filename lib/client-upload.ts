import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";

export type ClientUploadPurpose =
  | { kind: "avatar"; userId: string }
  | { kind: "house-image"; houseId: string }
  | { kind: "announcement-asset"; announcementId: string };

function safeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  return /^[a-z0-9]{1,10}$/.test(extension) ? extension : "bin";
}

function safeFileName(file: File) {
  const name = file.name
    .replace(/[\\/]+/g, "_")
    .replace(/[?#%]/g, "_")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 120);
  return name || `upload.${safeExtension(file)}`;
}

export async function uploadUserFile(
  file: File,
  purpose: ClientUploadPurpose,
  onProgress?: (percentage: number) => void,
): Promise<PutBlobResult> {
  const prefix = purpose.kind === "avatar"
    ? `user-avatars/${purpose.userId}`
    : purpose.kind === "house-image"
      ? `houses/${purpose.houseId}`
      : `announcements/${purpose.announcementId}`;
  const pathname = `${prefix}/${crypto.randomUUID()}-${safeFileName(file)}`;

  const clientPayload = JSON.stringify(purpose);

  try {
    return await upload(pathname, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      handleUploadUrl: "/api/uploads",
      clientPayload,
      onUploadProgress: onProgress
        ? ({ percentage }) => onProgress(percentage)
        : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("Failed to retrieve the client token")) throw error;

    try {
      // The Blob SDK intentionally hides the token endpoint response body. Repeat
      // only the authorization request so the UI can show its actionable reason.
      const response = await fetch("/api/uploads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blob.generate-client-token",
          payload: { pathname, clientPayload, multipart: false },
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok && result.error) throw new Error(result.error);
    } catch (diagnosticError) {
      if (diagnosticError instanceof Error && diagnosticError.message) throw diagnosticError;
    }

    throw new Error("Vercel Blob needs BLOB_READ_WRITE_TOKEN. In Vercel, open Storage → your Blob store → Settings/Connections, edit its Baraka Nest connection, enable 'Add a read-write token env var', save, then redeploy.");
  }
}
