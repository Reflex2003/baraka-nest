import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/better-auth";
import { query } from "@/lib/db";
import { getBlobWriteAuthOptions, hasBlobWriteAuth } from "@/lib/blob-auth";
import { isSameOriginMutation } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No avatar file was provided." },
        { status: 400 },
      );
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Avatar must be 4MB or smaller." },
        { status: 400 },
      );
    }

    const existing = await query<{ image: string | null }>(
      "SELECT image FROM user WHERE id = ? LIMIT 1",
      [session.user.id],
    );

    const previousImage = existing.rows[0]?.image ?? null;

    const rawExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const extension = /^[a-z0-9]{1,8}$/.test(rawExtension) ? rawExtension : "jpg";

    const filename = `avatars/${session.user.id}-${Date.now()}.${extension}`;
    const blobAuth = getBlobWriteAuthOptions(request);
    if (!hasBlobWriteAuth(blobAuth)) {
      return NextResponse.json({ error: "Blob upload is not enabled on this Vercel deployment. Reconnect the Blob store with a read-write token, or redeploy with Vercel OIDC enabled." }, { status: 503 });
    }

    const uploaded = await put(filename, file, {
      access: "public",
      ...blobAuth,
    });

    await query(
      "UPDATE user SET image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [uploaded.url, session.user.id],
    );

    if (
      previousImage &&
      previousImage.includes(".public.blob.vercel-storage.com/")
    ) {
      try {
        await del(previousImage);
      } catch {
        // Keep the new avatar even if deleting the old blob fails.
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl: uploaded.url,
    });
  } catch (error) {
    console.error("Avatar upload failed:", error);

    return NextResponse.json(
      { error: "Failed to upload avatar." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const existing = await query<{ image: string | null }>(
      "SELECT image FROM user WHERE id = ? LIMIT 1",
      [session.user.id],
    );

    const currentImage = existing.rows[0]?.image ?? null;

    await query(
      "UPDATE user SET image = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [session.user.id],
    );

    if (
      currentImage &&
      currentImage.includes(".public.blob.vercel-storage.com/")
    ) {
      try {
        await del(currentImage);
      } catch {
        // The database is already cleared even if blob deletion fails.
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl: null,
    });
  } catch (error) {
    console.error("Avatar removal failed:", error);

    return NextResponse.json(
      { error: "Failed to remove avatar." },
      { status: 500 },
    );
  }
}
