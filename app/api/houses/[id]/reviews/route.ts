import { NextResponse } from "next/server";
import {
  createHouseReview,
  getHouseReviewSummary,
  getHouseReviews,
} from "@/lib/house-reviews";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [reviews, summary] = await Promise.all([
      getHouseReviews(id),
      getHouseReviewSummary(id),
    ]);

    return NextResponse.json({
      reviews,
      summary,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load reviews." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment : "";

    const review = await createHouseReview(id, rating, comment);

    return NextResponse.json(
      { review },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review.";

    const status =
      message.includes("logged in")
        ? 401
        : message.includes("already reviewed")
          ? 409
          : message.includes("not found")
            ? 404
            : 400;

    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
