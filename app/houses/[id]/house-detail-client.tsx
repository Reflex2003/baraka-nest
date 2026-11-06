"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useLanguage, type Language } from "../../language-context";
import { getMapEmbedUrl, getMapSearchUrl } from "@/lib/houses";
import type { House } from "./page";

type Review = {
  id: string;
  houseId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

const translations = {
  English: {
    houses: "Houses",
    roommates: "Roommates",
    login: "Log in",
    getStarted: "Get started",
    back: "Back to houses",
    studentResidence: "Student residence",
    available: "available",
    about: "About this place",
    aboutTitle: "A place built around student life.",
    amenities: "Amenities",
    location: "Location",
    exactLocation:
      "Exact location details can be shared after an inquiry.",
    monthlyRent: "Monthly rent",
    perMonth: "per month",
    spaces: "spaces",
    distance: "Distance",
    rating: "Rating",
    interested: "I am interested",
    signIn: "Sign in to send an inquiry about this house.",
    barakaNest: "Baraka Nest",
    tagline: "Student housing made simpler.",
    studentLife: "Student life",
    mapNote:
      "Approximate neighbourhood location; confirm the exact address with the host.",
    directions: "Get directions",
    nearby: "Nearby essentials",
    shops: "Shopping centres and useful places",
    transport: "Find public transport nearby",
    reviews: "Reviews",
    noReviews: "No reviews yet.",
    beFirst: "Be the first to review this house.",
    writeReview: "Write a review",
    yourRating: "Your rating",
    yourReview: "Your review",
    reviewPlaceholder: "Tell other students what you think about this place...",
    submitReview: "Submit review",
    submitting: "Submitting...",
    loginToReview: "Log in to leave a review.",
    reviewSuccess: "Review posted successfully.",
    reviewError: "Could not post your review.",
    characters: "characters",
    stars: "stars",
  },

  Swahili: {
    houses: "Nyumba",
    roommates: "Roommates",
    login: "Ingia",
    getStarted: "Anza",
    back: "Rudi kwa nyumba",
    studentResidence: "Makazi ya wanafunzi",
    available: "zinapatikana",
    about: "Kuhusu mahali hapa",
    aboutTitle: "Mahali palipotengenezwa kwa maisha ya mwanafunzi.",
    amenities: "Huduma zilizopo",
    location: "Eneo",
    exactLocation:
      "Maelezo kamili ya eneo yanaweza kushirikiwa baada ya kutuma ombi.",
    monthlyRent: "Kodi ya mwezi",
    perMonth: "kwa mwezi",
    spaces: "nafasi",
    distance: "Umbali",
    rating: "Rating",
    interested: "Ninavutiwa",
    signIn: "Ingia ili kutuma ombi kuhusu nyumba hii.",
    barakaNest: "Baraka Nest",
    tagline: "Makazi ya wanafunzi yamekuwa rahisi.",
    studentLife: "Maisha ya mwanafunzi",
    mapNote:
      "Eneo la mtaa ni la makadirio; thibitisha anwani kamili na mwenye nyumba.",
    directions: "Pata maelekezo",
    nearby: "Huduma za karibu",
    shops: "Maduka na huduma muhimu",
    transport: "Tafuta usafiri wa umma karibu",
    reviews: "Reviews",
    noReviews: "Hakuna reviews bado.",
    beFirst: "Kuwa wa kwanza kureview hii nyumba.",
    writeReview: "Andika review",
    yourRating: "Rating yako",
    yourReview: "Review yako",
    reviewPlaceholder:
      "Waambie students wengine unafikiria nini kuhusu hii place...",
    submitReview: "Tuma review",
    submitting: "Inatuma...",
    loginToReview: "Ingia ili kuacha review.",
    reviewSuccess: "Review imetumwa vizuri.",
    reviewError: "Review haikuweza kutumwa.",
    characters: "characters",
    stars: "stars",
  },

  Sheng: {
    houses: "Nyumba",
    roommates: "Roommates",
    login: "Log in",
    getStarted: "Get started",
    back: "Rudi kwa nyumba",
    studentResidence: "Student residence",
    available: "ziko available",
    about: "Kuhusu hii place",
    aboutTitle: "Place imejengwa na student life kwa akili.",
    amenities: "Amenities",
    location: "Area",
    exactLocation:
      "Exact location inaweza shareiwa baada ya inquiry.",
    monthlyRent: "Rent ya mwezi",
    perMonth: "per month",
    spaces: "spaces",
    distance: "Distance",
    rating: "Rating",
    interested: "Niko interested",
    signIn: "Log in utume inquiry kuhusu hii house.",
    barakaNest: "Baraka Nest",
    tagline: "Student housing imekuwa easier.",
    studentLife: "Student life",
    mapNote:
      "Hii ni area ya kukadiria; confirm exact address na host.",
    directions: "Pata directions",
    nearby: "Vitu muhimu karibu",
    shops: "Shopping centres na places muhimu",
    transport: "Saka public transport karibu",
    reviews: "Reviews",
    noReviews: "Hakuna reviews bado.",
    beFirst: "Kuwa wa kwanza kureview hii place.",
    writeReview: "Andika review",
    yourRating: "Rating yako",
    yourReview: "Review yako",
    reviewPlaceholder:
      "Waambie wasee wengine unafikiria nini kuhusu hii place...",
    submitReview: "Tuma review",
    submitting: "Inatuma...",
    loginToReview: "Log in ndio uache review.",
    reviewSuccess: "Review imepostiwa poa.",
    reviewError: "Review imekataa kupostiwa.",
    characters: "characters",
    stars: "stars",
  },
};

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString()}`;
}

function translateAmenity(
  amenity: string,
  language: Language,
) {
  if (language === "English") {
    return amenity;
  }

  if (language === "Swahili") {
    const swahili: Record<string, string> = {
      "24/7 security": "Usalama wa saa 24/7",
      "Reliable water": "Maji ya uhakika",
      "Wi-Fi available": "Wi-Fi inapatikana",
      "Secure parking": "Parking salama",
      CCTV: "CCTV",
      "Laundry area": "Eneo la kufulia",
      "Prepaid electricity": "Stima ya prepaid",
      "Nearby shops": "Maduka karibu",
      "Common area": "Eneo la pamoja",
      "Public transport nearby": "Usafiri wa umma karibu",
    };

    return swahili[amenity] ?? amenity;
  }

  const sheng: Record<string, string> = {
    "24/7 security": "Security 24/7",
    "Reliable water": "Maji iko sawa",
    "Wi-Fi available": "Wi-Fi iko available",
    "Secure parking": "Parking iko safe",
    CCTV: "CCTV",
    "Laundry area": "Place ya kufulia",
    "Prepaid electricity": "Stima ya prepaid",
    "Nearby shops": "Shops ziko karibu",
    "Common area": "Common area",
    "Public transport nearby": "Matatu iko karibu",
  };

  return sheng[amenity] ?? amenity;
}

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function ReviewStars({
  rating,
  interactive = false,
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= rating;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onSelect?.(star)}
              aria-label={`${star} stars`}
              className={`text-2xl leading-none transition ${
                active
                  ? "scale-110 text-black"
                  : "text-black/15 hover:scale-110 hover:text-black/40"
              }`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={star}
            className={`text-sm ${
              active ? "text-black" : "text-black/15"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function HouseDetailClient({
  house,
}: {
  house: House;
}) {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    reviewCount: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        setReviewsLoading(true);

        const response = await fetch(
          `/api/houses/${encodeURIComponent(house.id)}/reviews`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load reviews.");
        }

        if (!cancelled) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setReviewSummary(
            data.summary ?? {
              averageRating: 0,
              reviewCount: 0,
            },
          );
        }
      } catch {
        if (!cancelled) {
          setReviews([]);
          setReviewSummary({
            averageRating: 0,
            reviewCount: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [house.id]);

  async function submitReview() {
    if (rating < 1 || rating > 5 || comment.trim().length < 3) {
      setReviewMessage(
        t.reviewError,
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage("");

      const response = await fetch(
        `/api/houses/${encodeURIComponent(house.id)}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.reviewError);
      }

      setReviewMessage(t.reviewSuccess);
      setRating(0);
      setComment("");

      const refreshResponse = await fetch(
        `/api/houses/${encodeURIComponent(house.id)}/reviews`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        setReviews(
          Array.isArray(refreshData.reviews)
            ? refreshData.reviews
            : [],
        );

        setReviewSummary(
          refreshData.summary ?? {
            averageRating: 0,
            reviewCount: 0,
          },
        );
      }
    } catch (error) {
      setReviewMessage(
        error instanceof Error
          ? error.message
          : t.reviewError,
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#183b2c]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/houses"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
        >
          <span className="text-lg">←</span>
          {t.back}
        </Link>

        <section className="mt-8 overflow-hidden rounded-[36px] bg-[#111111] text-white shadow-2xl">
          <div className="relative min-h-[440px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] via-transparent to-black" />

            <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-3xl" />

            <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-white/[0.03] blur-3xl" />

            <div className="relative flex min-h-[440px] flex-col justify-between p-7 sm:p-10 lg:p-14">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                    {house.type}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/60">
                    {house.available} {t.available}
                  </span>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/50">
                  ★ {reviewSummary.reviewCount > 0
                    ? reviewSummary.averageRating.toFixed(1)
                    : house.rating}
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                  {t.studentResidence}
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  {house.name}
                </h1>

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
                  <span>⌖ {house.location}</span>
                  <span>•</span>
                  <span>{house.distance}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                {t.about}
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                {t.aboutTitle}
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/50">
                {house.description}
              </p>
            </section>

            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                {t.amenities}
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {house.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl bg-[#fafafa] px-4 py-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                      ✓
                    </span>

                    <span className="text-sm font-medium text-black/70">
                      {translateAmenity(
                        amenity,
                        currentLanguage,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                    {t.reviews}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-3xl font-semibold tracking-[-0.04em]">
                      {reviewSummary.reviewCount > 0
                        ? reviewSummary.averageRating.toFixed(1)
                        : "—"}
                    </span>

                    <div>
                      <ReviewStars
                        rating={
                          reviewSummary.reviewCount > 0
                            ? Math.round(
                                reviewSummary.averageRating,
                              )
                            : 0
                        }
                      />

                      <p className="mt-1 text-xs text-black/35">
                        {reviewSummary.reviewCount}{" "}
                        {t.reviews.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-full bg-black/[0.04] px-4 py-2 text-xs font-medium text-black/50">
                  {t.rating}
                </div>
              </div>

              <div className="mt-8 border-t border-black/[0.07] pt-7">
                <p className="text-sm font-semibold text-black/75">
                  {t.writeReview}
                </p>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-black/40">
                    {t.yourRating}
                  </p>

                  <ReviewStars
                    rating={rating}
                    interactive
                    onSelect={setRating}
                  />
                </div>

                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  maxLength={1000}
                  placeholder={t.reviewPlaceholder}
                  className="mt-5 min-h-32 w-full resize-y rounded-2xl border border-black/[0.08] bg-[#fafafa] px-4 py-4 text-sm text-black outline-none transition placeholder:text-black/25 focus:border-black/20 focus:bg-white"
                />

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-black/30">
                    {comment.length}/1000 {t.characters}
                  </span>

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={
                      submittingReview ||
                      rating < 1 ||
                      comment.trim().length < 3
                    }
                    className="rounded-full bg-black px-5 py-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {submittingReview
                      ? t.submitting
                      : t.submitReview}
                  </button>
                </div>

                {reviewMessage ? (
                  <p className="mt-4 rounded-2xl bg-black/[0.04] px-4 py-3 text-xs leading-5 text-black/55">
                    {reviewMessage}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 space-y-4">
                {reviewsLoading ? (
                  <>
                    <div className="h-24 animate-pulse rounded-2xl bg-black/[0.04]" />
                    <div className="h-24 animate-pulse rounded-2xl bg-black/[0.04]" />
                  </>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl bg-[#fafafa] px-5 py-6 text-center">
                    <p className="text-sm font-medium text-black/55">
                      {t.noReviews}
                    </p>

                    <p className="mt-1 text-xs text-black/30">
                      {t.beFirst}
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                            {review.username
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-black/75">
                              {review.username}
                            </p>

                            <p className="mt-0.5 text-[11px] text-black/30">
                              {formatReviewDate(
                                review.createdAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <ReviewStars
                          rating={review.rating}
                        />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-black/55">
                        {review.comment}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                {t.location}
              </p>

              <iframe
                title={`${house.location} map`}
                src={getMapEmbedUrl(house)}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="mt-6 h-[280px] w-full rounded-3xl border-0 bg-[#f1f4ef] sm:h-[340px]"
              />

              <p className="mt-4 text-xs leading-5 text-[#718077]">
                {t.mapNote} {house.distance}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getMapSearchUrl(
                    house.location,
                    house.location,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full bg-[#183b2c] px-4 text-xs font-bold text-white transition hover:bg-[#285640]"
                >
                  {t.directions}
                </a>

                <a
                  href={getMapSearchUrl(
                    house.location,
                    "shopping centre supermarket pharmacy",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-[#dce5db] px-4 text-xs font-bold text-[#355342] transition hover:bg-[#f3f6f1]"
                >
                  {t.shops}
                </a>

                <a
                  href={getMapSearchUrl(
                    house.location,
                    "matatu bus stage",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-full border border-[#dce5db] px-4 text-xs font-bold text-[#355342] transition hover:bg-[#f3f6f1]"
                >
                  {t.transport}
                </a>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                {t.monthlyRent}
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.04em]">
                    {formatPrice(house.price)}
                  </p>

                  <p className="mt-1 text-xs text-black/35">
                    {t.perMonth}
                  </p>
                </div>

                <div className="rounded-full bg-black/[0.04] px-3 py-2 text-xs font-medium">
                  {house.rooms}
                </div>
              </div>

              <div className="my-7 h-px bg-black/[0.07]" />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    {t.available}
                  </span>

                  <span className="text-sm font-semibold">
                    {house.available} {t.spaces}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    {t.location}
                  </span>

                  <span className="max-w-[180px] text-right text-sm font-semibold">
                    {house.location}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    {t.distance}
                  </span>

                  <span className="text-sm font-semibold">
                    {house.distance.replace(
                      " from campus",
                      "",
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    {t.rating}
                  </span>

                  <span className="text-sm font-semibold">
                    ★{" "}
                    {reviewSummary.reviewCount > 0
                      ? reviewSummary.averageRating.toFixed(1)
                      : house.rating}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-8 h-14 w-full rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-black/80"
              >
                {t.interested}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-black/30">
                {t.signIn}
              </p>
            </div>

            <div className="mt-4 rounded-[28px] border border-black/[0.08] bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  BN
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {t.barakaNest}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    {t.tagline}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link
          href="/"
          className="font-semibold text-black"
        >
          Baraka<span className="text-black/30">Nest</span>
        </Link>

        <div className="flex gap-6">
          <Link
            href="/houses"
            className="transition hover:text-black"
          >
            {t.houses}
          </Link>

          <Link
            href="/roommates"
            className="transition hover:text-black"
          >
            {t.roommates}
          </Link>

          <Link
            href="/login"
            className="transition hover:text-black"
          >
            {t.login}
          </Link>
        </div>

        <span>
          © {new Date().getFullYear()} Baraka Nest
        </span>
      </footer>
    </main>
  );
}