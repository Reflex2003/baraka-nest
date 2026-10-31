"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../language-context";
import Navbar from "../../navbar";

type RoommateProfile = {
  id: string;
  username: string;
  name: string;
  age: number;
  school: string;
  location: string;
  budget: number;
  moveIn: string;
  preference: string;
  about: string;
  interests: string[];
  lifestyle: string[];
};

const translations = {
  English: {
    back: "← Back to roommates",
    about: "About",
    lookingFor: "Looking for",
    monthlyBudget: "Monthly budget",
    location: "Location",
    school: "School",
    moveIn: "Move-in",
    interests: "Interests",
    lifestyle: "Lifestyle",
    connect: "Connect with",
    sending: "Sending...",
    requestSent: "Request sent",
    profileNotFound: "Profile not found",
    profileNotFoundText: "This roommate profile does not exist.",
    backToRoommates: "Back to roommates",
    loading: "Loading profile...",
    connectionError: "Something went wrong. Please try again.",
  },

  Swahili: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anatafuta",
    monthlyBudget: "Bajeti ya mwezi",
    location: "Eneo",
    school: "Chuo",
    moveIn: "Kuhamia",
    interests: "Anapenda",
    lifestyle: "Lifestyle",
    connect: "Wasiliana na",
    sending: "Inatuma...",
    requestSent: "Ombi limetumwa",
    profileNotFound: "Profile haijapatikana",
    profileNotFoundText: "Profile hii ya roommate haipo.",
    backToRoommates: "Rudi kwa roommates",
    loading: "Inapakia profile...",
    connectionError: "Kuna tatizo. Jaribu tena.",
  },

  Sheng: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anadai",
    monthlyBudget: "Budget ya mwezi",
    location: "Area",
    school: "Campus",
    moveIn: "Move-in",
    interests: "Vitu anapenda",
    lifestyle: "Lifestyle",
    connect: "Connect na",
    sending: "Inatuma...",
    requestSent: "Request imetumwa",
    profileNotFound: "Profile haipatikani",
    profileNotFoundText: "Hii profile ya roommate haiko.",
    backToRoommates: "Rudi kwa roommates",
    loading: "Inaload profile...",
    connectionError: "Kuna noma imehappen. Jaribu tena.",
  },
};

type Language = keyof typeof translations;

export default function RoommateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { language } = useLanguage();

  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/roommates/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) {
            setNotFound(true);
            setLoading(false);
          }

          return;
        }

        const data = await response.json();

        if (active) {
          setProfile(data.profile);
          setLoading(false);
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        if (active) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [params]);

  async function handleConnect() {
    if (!profile || connecting || connected) {
      return;
    }

    setConnecting(true);
    setConnectionError("");

    try {
      const response = await fetch(
        `/api/roommates/${profile.id}/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setConnectionError(data.error || t.connectionError);
        setConnecting(false);
        return;
      }

      setConnected(true);
      setConnecting(false);
    } catch (error) {
      console.error("Connection request error:", error);

      setConnectionError(t.connectionError);
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#183b2c]">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/roommates"
              className="text-sm font-semibold text-[#68776d] transition hover:text-[#e58b45]"
            >
              {t.back}
            </Link>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#e3e7df] bg-white shadow-sm">
              <div className="animate-pulse bg-[#dfe8dc] px-6 py-10 sm:px-10">
                <div className="flex items-center gap-5">
                  <div className="h-24 w-24 rounded-full bg-white/70" />

                  <div>
                    <div className="h-8 w-48 rounded-lg bg-white/70" />
                    <div className="mt-3 h-4 w-64 rounded-lg bg-white/70" />
                    <div className="mt-3 h-7 w-28 rounded-full bg-white/70" />
                  </div>
                </div>
              </div>

              <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <div className="h-6 w-32 rounded bg-[#e8ece5]" />
                  <div className="h-4 w-full rounded bg-[#eef1eb]" />
                  <div className="h-4 w-5/6 rounded bg-[#eef1eb]" />
                  <div className="mt-8 h-6 w-32 rounded bg-[#e8ece5]" />
                  <div className="h-4 w-full rounded bg-[#eef1eb]" />
                </div>

                <div className="h-64 rounded-3xl bg-[#f0f3ed]" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#183b2c]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e9eee6] text-3xl">
              ?
            </div>

            <h1 className="mt-6 text-4xl font-bold">
              {t.profileNotFound}
            </h1>

            <p className="mt-3 text-[#68776d]">
              {t.profileNotFoundText}
            </p>

            <Link
              href="/roommates"
              className="mt-6 inline-block rounded-2xl bg-[#183b2c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#285640]"
            >
              {t.backToRoommates}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#183b2c]">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/roommates"
            className="text-sm font-semibold text-[#68776d] transition hover:text-[#e58b45]"
          >
            {t.back}
          </Link>

          <section className="mt-6 overflow-hidden rounded-3xl border border-[#e3e7df] bg-white shadow-sm">
            <div className="bg-[#dfe8dc] px-6 py-10 sm:px-10">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold shadow-sm">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-3xl font-bold">
                    {profile.name}, {profile.age}
                  </h1>

                  <p className="mt-1 text-[#68776d]">
                    {profile.school} · {profile.location}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
                    {profile.preference}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-xl font-bold">
                  {t.about} {profile.name}
                </h2>

                <p className="mt-3 leading-7 text-[#68776d]">
                  {profile.about}
                </p>

                <h2 className="mt-8 text-xl font-bold">
                  {t.lookingFor}
                </h2>

                <p className="mt-3 leading-7 text-[#68776d]">
                  {profile.preference}
                </p>

                {profile.interests.length > 0 && (
                  <>
                    <h2 className="mt-8 text-xl font-bold">
                      {t.interests}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-sm font-medium text-[#526258]"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {profile.lifestyle.length > 0 && (
                  <>
                    <h2 className="mt-8 text-xl font-bold">
                      {t.lifestyle}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.lifestyle.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-sm font-medium text-[#526258]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <aside className="h-fit rounded-3xl bg-[#f5f7f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                  {t.monthlyBudget}
                </p>

                <p className="mt-1 text-2xl font-bold">
                  KSh {profile.budget.toLocaleString()}
                </p>

                <div className="my-5 h-px bg-[#dfe5dd]" />

                <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                  {t.location}
                </p>

                <p className="mt-1 font-semibold">{profile.location}</p>

                <div className="my-5 h-px bg-[#dfe5dd]" />

                <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                  {t.school}
                </p>

                <p className="mt-1 font-semibold">{profile.school}</p>

                <div className="my-5 h-px bg-[#dfe5dd]" />

                <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                  {t.moveIn}
                </p>

                <p className="mt-1 font-semibold">{profile.moveIn}</p>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting || connected}
                  className={`mt-6 w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition ${
                    connected
                      ? "cursor-default bg-[#dfe8dc] text-[#183b2c]"
                      : connecting
                        ? "cursor-wait bg-[#52715f] text-white"
                        : "bg-[#183b2c] text-white hover:bg-[#285640]"
                  }`}
                >
                  {connecting
                    ? t.sending
                    : connected
                      ? `✓ ${t.requestSent}`
                      : `${t.connect} ${profile.name}`}
                </button>

                {connectionError && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-700">
                    {connectionError}
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}