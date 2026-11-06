import { randomUUID } from "crypto";
import { ensureFeatureTables, query } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

export type HouseReview = {
  id: string;
  houseId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export type HouseReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

type ReviewRow = {
  id: string;
  house_id: string;
  user_id: string;
  username: string | null;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

function formatReview(row: ReviewRow): HouseReview {
  return {
    id: row.id,
    houseId: row.house_id,
    userId: row.user_id,
    username: row.username?.trim() || "Baraka Nest User",
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateRating(rating: number) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

function validateComment(comment: string) {
  const value = comment.trim();

  if (value.length < 3) {
    throw new Error("Review must be at least 3 characters long.");
  }

  if (value.length > 1000) {
    throw new Error("Review must not exceed 1000 characters.");
  }

  return value;
}

async function houseExists(houseId: string) {
  await ensureFeatureTables();

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

export async function getHouseReviews(houseId: string) {
  await ensureFeatureTables();

  const result = await query<ReviewRow>(
    `
      SELECT
        r.id,
        r.house_id,
        r.user_id,
        u.name AS username,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at
      FROM house_review r
      LEFT JOIN user u ON u.id = r.user_id
      WHERE r.house_id = ?
        AND r.status = 'visible'
      ORDER BY r.created_at DESC
    `,
    [houseId],
  );

  return result.rows.map(formatReview);
}

export async function getHouseReviewSummary(
  houseId: string,
): Promise<HouseReviewSummary> {
  await ensureFeatureTables();

  const result = await query<{
    average_rating: number | null;
    review_count: number | null;
  }>(
    `
      SELECT
        AVG(rating) AS average_rating,
        COUNT(id) AS review_count
      FROM house_review
      WHERE house_id = ?
        AND status = 'visible'
    `,
    [houseId],
  );

  const row = result.rows[0];

  const averageRating = Number(row?.average_rating ?? 0);
  const reviewCount = Number(row?.review_count ?? 0);

  return {
    averageRating: Number.isFinite(averageRating)
      ? Math.round(averageRating * 10) / 10
      : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
  };
}

export async function getCurrentUserHouseReview(houseId: string) {
  await ensureFeatureTables();

  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const result = await query<{
    id: string;
    house_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT
        id,
        house_id,
        user_id,
        rating,
        comment,
        created_at,
        updated_at
      FROM house_review
      WHERE house_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [houseId, session.user.id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    houseId: row.house_id,
    userId: row.user_id,
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createHouseReview(
  houseId: string,
  rating: number,
  comment: string,
) {
  await ensureFeatureTables();

  const session = await getSession();

  if (!session?.user) {
    throw new Error("You must be logged in to review a house.");
  }

  if (!(await houseExists(houseId))) {
    throw new Error("House listing not found.");
  }

  if (!validateRating(rating)) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  const cleanComment = validateComment(comment);

  const existingResult = await query<{ id: string }>(
    `
      SELECT id
      FROM house_review
      WHERE house_id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [houseId, session.user.id],
  );

  if (existingResult.rows[0]) {
    throw new Error("You have already reviewed this house.");
  }

  const id = randomUUID();

  await query(
    `
      INSERT INTO house_review (
        id,
        house_id,
        user_id,
        rating,
        comment,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'visible')
    `,
    [
      id,
      houseId,
      session.user.id,
      rating,
      cleanComment,
    ],
  );

  return {
    id,
    houseId,
    rating,
    comment: cleanComment,
  };
}

export async function updateHouseReview(
  reviewId: string,
  rating: number,
  comment: string,
) {
  await ensureFeatureTables();

  const session = await getSession();

  if (!session?.user) {
    throw new Error("You must be logged in to edit a review.");
  }

  if (!validateRating(rating)) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  const cleanComment = validateComment(comment);

  const result = await query<{
    id: string;
    user_id: string;
  }>(
    `
      SELECT id, user_id
      FROM house_review
      WHERE id = ?
      LIMIT 1
    `,
    [reviewId],
  );

  const review = result.rows[0];

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.user_id !== session.user.id) {
    throw new Error("You can only edit your own review.");
  }

  await query(
    `
      UPDATE house_review
      SET
        rating = ?,
        comment = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
    `,
    [
      rating,
      cleanComment,
      reviewId,
      session.user.id,
    ],
  );

  return {
    id: reviewId,
    rating,
    comment: cleanComment,
  };
}

export async function deleteHouseReview(reviewId: string) {
  await ensureFeatureTables();

  const session = await getSession();

  if (!session?.user) {
    throw new Error("You must be logged in to delete a review.");
  }

  const result = await query<{
    id: string;
    user_id: string;
  }>(
    `
      SELECT id, user_id
      FROM house_review
      WHERE id = ?
      LIMIT 1
    `,
    [reviewId],
  );

  const review = result.rows[0];

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.user_id !== session.user.id) {
    throw new Error("You can only delete your own review.");
  }

  await query(
    `
      DELETE FROM house_review
      WHERE id = ?
        AND user_id = ?
    `,
    [
      reviewId,
      session.user.id,
    ],
  );

  return {
    success: true,
    id: reviewId,
  };
}