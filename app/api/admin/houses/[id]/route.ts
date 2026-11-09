import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/better-auth";
import { isSuperAdminUserId } from "@/lib/admin";
import { query } from "@/lib/db";
import { isSameOriginMutation } from "@/lib/request-security";

export const runtime = "nodejs";

const MAX_FILES_PER_UPLOAD = 10;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

type HouseImageRow = {
  id: string;
  house_id: string;
  url: string;
  blob_path: string;
  sort_order: number;
  is_cover: number;
  created_at: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

async function houseExists(houseId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM house_listing
      WHERE id = ?
      LIMIT 1
    `,
    [houseId],
  );

  return Boolean(result.rows[0]);
}

async function getHouseImages(houseId: string) {
  const result = await query<HouseImageRow>(
    `
      SELECT
        id,
        house_id,
        url,
        blob_path,
        sort_order,
        is_cover,
        created_at
      FROM house_image
      WHERE house_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `,
    [houseId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    houseId: row.house_id,
    url: row.url,
    blobPath: row.blob_path,
    sortOrder: Number(row.sort_order),
    isCover: Number(row.is_cover) === 1,
    createdAt: row.created_at,
  }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!(await houseExists(id))) {
      return NextResponse.json(
        { error: "House listing not found." },
        { status: 404 },
      );
    }

    const images = await getHouseImages(id);

    return NextResponse.json({
      houseId: id,
      images,
    });
  } catch (error) {
    console.error("House images lookup failed:", error);

    return NextResponse.json(
      { error: "Failed to load house images." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
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

    const { id: houseId } = await params;

    if (!(await houseExists(houseId))) {
      return NextResponse.json(
        { error: "House listing not found." },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { error: "No image files were provided." },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        {
          error: `You can upload a maximum of ${MAX_FILES_PER_UPLOAD} images at once.`,
        },
        { status: 400 },
      );
    }

    const existingImages = await getHouseImages(houseId);

    let nextSortOrder =
      existingImages.length > 0
        ? Math.max(...existingImages.map((image) => image.sortOrder)) + 1
        : 0;

    const uploadedImages: Array<{
      id: string;
      houseId: string;
      url: string;
      blobPath: string;
      sortOrder: number;
      isCover: boolean;
      createdAt: string;
    }> = [];

    const shouldCreateCover = existingImages.length === 0;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: `"${file.name}" is not an image file.`,
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `"${file.name}" is larger than 25MB.`,
          },
          { status: 400 },
        );
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension = /^[a-z0-9]+$/.test(extension)
        ? extension
        : "jpg";

      const imageId = randomUUID();

      const blobPath = `houses/${houseId}/${imageId}.${safeExtension}`;

      const uploaded = await put(blobPath, file, {
        access: "public",
      });

      const isCover =
        shouldCreateCover && uploadedImages.length === 0;

      const createdAt = new Date().toISOString();

      await query(
        `
          INSERT INTO house_image (
            id,
            house_id,
            url,
            blob_path,
            sort_order,
            is_cover,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          imageId,
          houseId,
          uploaded.url,
          blobPath,
          nextSortOrder,
          isCover ? 1 : 0,
          createdAt,
        ],
      );

      uploadedImages.push({
        id: imageId,
        houseId,
        url: uploaded.url,
        blobPath,
        sortOrder: nextSortOrder,
        isCover,
        createdAt,
      });

      nextSortOrder += 1;
    }

    return NextResponse.json(
      {
        success: true,
        houseId,
        images: uploadedImages,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("House image upload failed:", error);

    return NextResponse.json(
      { error: "Failed to upload house images." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
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

    const { id: houseId } = await params;

    if (!(await houseExists(houseId))) {
      return NextResponse.json(
        { error: "House listing not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    if (body.action === "set-cover") {
      const imageId =
        typeof body.imageId === "string"
          ? body.imageId
          : "";

      if (!imageId) {
        return NextResponse.json(
          { error: "Image ID is required." },
          { status: 400 },
        );
      }

      const imageResult = await query<{ id: string }>(
        `
          SELECT id
          FROM house_image
          WHERE id = ?
            AND house_id = ?
          LIMIT 1
        `,
        [imageId, houseId],
      );

      if (!imageResult.rows[0]) {
        return NextResponse.json(
          { error: "House image not found." },
          { status: 404 },
        );
      }

      await query(
        `
          UPDATE house_image
          SET is_cover = 0
          WHERE house_id = ?
        `,
        [houseId],
      );

      await query(
        `
          UPDATE house_image
          SET is_cover = 1
          WHERE id = ?
            AND house_id = ?
        `,
        [imageId, houseId],
      );

      return NextResponse.json({
        success: true,
        images: await getHouseImages(houseId),
      });
    }

    if (body.action === "reorder") {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          { error: "Images must be an array." },
          { status: 400 },
        );
      }

      const existingImages = await getHouseImages(houseId);
      const existingIds = new Set(
        existingImages.map((image) => image.id),
      );

      const receivedIds = new Set<string>();

      for (const item of body.images) {
        if (
          !item ||
          typeof item.id !== "string" ||
          !Number.isInteger(item.sortOrder) ||
          item.sortOrder < 0
        ) {
          return NextResponse.json(
            { error: "Invalid image ordering data." },
            { status: 400 },
          );
        }

        if (!existingIds.has(item.id)) {
          return NextResponse.json(
            { error: "One or more images do not belong to this house." },
            { status: 400 },
          );
        }

        if (receivedIds.has(item.id)) {
          return NextResponse.json(
            { error: "Duplicate image IDs are not allowed." },
            { status: 400 },
          );
        }

        receivedIds.add(item.id);
      }

      if (receivedIds.size !== existingIds.size) {
        return NextResponse.json(
          { error: "All house images must be included when reordering." },
          { status: 400 },
        );
      }

      for (const item of body.images) {
        await query(
          `
            UPDATE house_image
            SET sort_order = ?
            WHERE id = ?
              AND house_id = ?
          `,
          [item.sortOrder, item.id, houseId],
        );
      }

      return NextResponse.json({
        success: true,
        images: await getHouseImages(houseId),
      });
    }

    return NextResponse.json(
      { error: "Unsupported image action." },
      { status: 400 },
    );
  } catch (error) {
    console.error("House image update failed:", error);

    return NextResponse.json(
      { error: "Failed to update house images." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
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

    const { id: houseId } = await params;

    if (!(await houseExists(houseId))) {
      return NextResponse.json(
        { error: "House listing not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    const imageId =
      typeof body.imageId === "string"
        ? body.imageId
        : "";

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
        { status: 400 },
      );
    }

    const result = await query<{
      id: string;
      blob_path: string;
      is_cover: number;
    }>(
      `
        SELECT
          id,
          blob_path,
          is_cover
        FROM house_image
        WHERE id = ?
          AND house_id = ?
        LIMIT 1
      `,
      [imageId, houseId],
    );

    const image = result.rows[0];

    if (!image) {
      return NextResponse.json(
        { error: "House image not found." },
        { status: 404 },
      );
    }

    await query(
      `
        DELETE FROM house_image
        WHERE id = ?
          AND house_id = ?
      `,
      [imageId, houseId],
    );

    try {
      await del(image.blob_path);
    } catch (blobError) {
      console.error(
        "House image blob cleanup failed:",
        blobError,
      );
    }

    if (Number(image.is_cover) === 1) {
      const remaining = await query<{
        id: string;
      }>(
        `
          SELECT id
          FROM house_image
          WHERE house_id = ?
          ORDER BY sort_order ASC, created_at ASC
          LIMIT 1
        `,
        [houseId],
      );

      if (remaining.rows[0]) {
        await query(
          `
            UPDATE house_image
            SET is_cover = 1
            WHERE id = ?
              AND house_id = ?
          `,
          [remaining.rows[0].id, houseId],
        );
      }
    }

    return NextResponse.json({
      success: true,
      deletedImageId: imageId,
      images: await getHouseImages(houseId),
    });
  } catch (error) {
    console.error("House image deletion failed:", error);

    return NextResponse.json(
      { error: "Failed to delete house image." },
      { status: 500 },
    );
  }
}
