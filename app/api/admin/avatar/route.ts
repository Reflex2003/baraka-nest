import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth";
import { isSameOriginMutation } from "@/lib/request-security";
import { isSuperAdminUserId } from "@/lib/admin";
import { query } from "@/lib/db";

export const runtime = "nodejs";

async function getAuthorizedAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const isAdmin = await isSuperAdminUserId(session.user.id);

  if (!isAdmin) {
    return null;
  }

  return session.user;
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginMutation(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const admin = await getAuthorizedAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 404 },
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Avatar must be 5MB or smaller." },
        { status: 400 },
      );
    }

    const existing = await query<{ image: string | null }>(
      "SELECT image FROM user WHERE id = ? LIMIT 1",
      [admin.id],
    );

    const previousImage = existing.rows[0]?.image ?? null;

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension = /^[a-z0-9]+$/.test(extension)
      ? extension
      : "jpg";

    const filename = `avatars/admin-${admin.id}-${Date.now()}.${safeExtension}`;

    const uploaded = await put(filename, file, {
      access: "public",
    });

    await query(
      "UPDATE user SET image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [uploaded.url, admin.id],
    );

    if (
      previousImage &&
      previousImage.includes(".public.blob.vercel-storage.com/")
    ) {
      try {
        await del(previousImage);
      } catch {
        // The database now points to the new avatar even if old-blob cleanup fails.
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl: uploaded.url,
    });
  } catch (error) {
    console.error("Admin avatar upload failed:", error);

    return NextResponse.json(
      { error: "Failed to upload admin avatar." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginMutation(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const admin = await getAuthorizedAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: 404 },
      );
    }

    const existing = await query<{ image: string | null }>(
      "SELECT image FROM user WHERE id = ? LIMIT 1",
      [admin.id],
    );

    const currentImage = existing.rows[0]?.image ?? null;

    await query(
      "UPDATE user SET image = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id],
    );

    if (
      currentImage &&
      currentImage.includes(".public.blob.vercel-storage.com/")
    ) {
      try {
        await del(currentImage);
      } catch {
        // Database removal succeeds even if blob cleanup fails.
      }
    }

    return NextResponse.json({
      success: true,
      avatarUrl: null,
    });
  } catch (error) {
    console.error("Admin avatar removal failed:", error);

    return NextResponse.json(
      { error: "Failed to remove admin avatar." },
      { status: 500 },
    );
  }
}