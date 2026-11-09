"use client";

import Link from "next/link";
import Image from "next/image";
import ProfileImageViewer from "@/components/ProfileImageViewer";
import { useEffect, useState } from "react";
import { useLanguage } from "../../language-context";
import Navbar from "../../navbar";

type RoommateProfile = {
  id: string;
  username: string;
  image: string | null;
  name: string;
  age: number;
  school: string;
  gender: string;
  location: string;
  budget: number;
  moveIn: string;
  preference: string;
  about: string;
  interests: string[];
  lifestyle: string[];
  matchBreakdown?: {
    budget: boolean;
    location: boolean;
    lifestyle: boolean;
    interests: boolean;
  } | null;
};

const translations = {
  English: {
    back: "← Back to roommates",
    about: "About",
    lookingFor: "Looking for",
    monthlyBudget: "Monthly budget",
    location: "Location",
    school: "School",
    gender: "Gender",
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
    match: "Shared preferences",
    matchItems: ["Budget", "Location", "Lifestyle", "Interests"],
    report: "Report profile", block: "Block profile", unblock: "Unblock",
    blocked: "This profile is blocked for you.", sendReport: "Send report",
    reportReason: "Reason", reportDetails: "More details (optional)",
    reportSent: "Thanks. Your report was sent for review.",
    reportError: "The report could not be sent. Please try again.",
    blockError: "We could not update this safety setting.",
    categories: ["Spam", "Unsafe behaviour", "Fake profile", "Harassment", "Other"],
  },

  Swahili: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anatafuta",
    monthlyBudget: "Bajeti ya mwezi",
    location: "Eneo",
    school: "Chuo",
    gender: "Jinsia",
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
    match: "Vitu mnavyofanana",
    matchItems: ["Budget", "Eneo", "Lifestyle", "Unachopenda"],
    report: "Ripoti wasifu", block: "Zuia wasifu", unblock: "Ondoa zuio",
    blocked: "Umezuia wasifu huu.", sendReport: "Tuma ripoti",
    reportReason: "Sababu", reportDetails: "Maelezo zaidi (si lazima)",
    reportSent: "Asante. Ripoti yako imetumwa ikaguliwe.",
    reportError: "Ripoti haikutumwa. Jaribu tena.",
    blockError: "Hatukuweza kubadilisha mipangilio hii ya usalama.",
    categories: ["Spam", "Tabia isiyo salama", "Wasifu wa uongo", "Unyanyasaji", "Nyingine"],
  },

  Sheng: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anadai",
    monthlyBudget: "Budget ya mwezi",
    location: "Area",
    school: "Campus",
    gender: "Gender",
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
    match: "Vitu mnafanana",
    matchItems: ["Budget", "Area", "Lifestyle", "Interests"],
    report: "Report profile", block: "Block profile", unblock: "Unblock",
    blocked: "Umeblock hii profile.", sendReport: "Tuma report",
    reportReason: "Reason", reportDetails: "Details zingine (optional)",
    reportSent: "Asante. Report yako imetumwa ichekiwe.",
    reportError: "Report haikutumwa. Jaribu tena.",
    blockError: "Hatujaweza update hii safety setting.",
    categories: ["Spam", "Unsafe", "Fake profile", "Harassment", "Other"],
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
  const [blocked, setBlocked] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportCategory, setReportCategory] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reporting, setReporting] = useState(false);

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
        const blockResponse = await fetch("/api/users/blocks", { credentials: "include" });
        if (blockResponse.ok && active) {
          const blockData = await blockResponse.json();
          setBlocked(Array.isArray(blockData.blocked) && blockData.blocked.includes(data.profile.id));
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

  async function handleBlock() {
    if (!profile) return;
    setBlockError("");
    try {
      const response = await fetch("/api/users/blocks", {
        method: blocked ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.blockError);
      setBlocked(!blocked);
    } catch {
      setBlockError(t.blockError);
    }
  }

  async function handleReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || reporting) return;
    setReporting(true);
    setReportError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          category: reportCategory,
          details: reportDetails,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.reportError);
      setReportSent(true);
      setShowReport(false);
      setReportDetails("");
    } catch {
      setReportError(t.reportError);
    } finally {
      setReporting(false);
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
                {profile.image ? (
                  <ProfileImageViewer src={profile.image} alt={`${profile.name} profile picture`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white text-3xl font-bold shadow-sm">
                    <Image src={profile.image} alt={`${profile.name} profile`} fill sizes="96px" unoptimized className="object-cover" />
                  </ProfileImageViewer>
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold shadow-sm">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}

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

            {profile.matchBreakdown && (
              <div className="mx-6 -mt-3 mb-2 rounded-2xl border border-[#e4ebe2] bg-[#fbfcfa] p-4 sm:mx-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#829087]">{t.match}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.matchItems.map((label, index) => {
                      const keys = ["budget", "location", "lifestyle", "interests"] as const;
                      const matched = profile.matchBreakdown?.[keys[index]];
                      return <span key={label} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${matched ? "bg-[#edf3ed] text-[#285640]" : "bg-[#f1f2ef] text-[#849087]"}`}>{matched ? "✓" : "·"} {label}</span>;
                    })}
                  </div>
                </div>
              </div>
            )}

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
                {profile.gender && <p className="mt-3 text-sm font-semibold text-emerald-800">{t.gender}: {profile.gender}</p>}

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

                <div className="mt-5 border-t border-[#e2e8e0] pt-4">
                  {blocked && <p className="mb-3 rounded-xl bg-[#f1f4ef] px-3 py-2 text-xs font-semibold text-[#526258]">{t.blocked}</p>}
                  <button type="button" onClick={() => void handleBlock()} className="min-h-10 w-full rounded-full border border-[#dfe6dd] px-4 text-xs font-bold text-[#526258] transition hover:bg-[#f4f6f2]">
                    {blocked ? t.unblock : t.block}
                  </button>
                  {blockError && <p role="alert" className="mt-2 text-xs text-red-700">{blockError}</p>}
                  <button type="button" onClick={() => setShowReport((value) => !value)} className="mt-3 min-h-9 w-full rounded-full px-4 text-xs font-semibold text-[#849087] transition hover:bg-[#f7f8f6] hover:text-[#526258]">
                    {t.report}
                  </button>
                  {reportSent && <p role="status" className="mt-2 text-xs font-semibold text-[#285640]">{t.reportSent}</p>}
                  {reportError && <p role="alert" className="mt-2 text-xs text-red-700">{reportError}</p>}
                  {showReport && <form onSubmit={handleReport} className="mt-3 space-y-2 rounded-2xl border border-[#e5ebe3] bg-white p-3">
                    <label className="block text-xs font-bold text-[#526258]">{t.reportReason}
                      <select value={reportCategory} onChange={(event) => setReportCategory(event.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-[#dfe6dd] bg-white px-3 text-xs">
                        {["spam", "unsafe", "fake", "harassment", "other"].map((item, index) => <option key={item} value={item}>{t.categories[index]}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-bold text-[#526258]">{t.reportDetails}
                      <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={1200} rows={3} className="mt-1 w-full rounded-xl border border-[#dfe6dd] px-3 py-2 text-xs outline-none focus:border-[#9bb39e]" />
                    </label>
                    <button disabled={reporting} className="min-h-10 w-full rounded-full bg-[#183b2c] px-4 text-xs font-bold text-white disabled:opacity-50">{reporting ? "…" : t.sendReport}</button>
                  </form>}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
