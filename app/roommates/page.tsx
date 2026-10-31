"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar";

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

const locations = [
  "All locations",
  "Kilimani",
  "Juja",
  "Kasarani",
  "Rongai",
  "Kahawa",
  "Ruiru",
  "Eldoret",
  "Nakuru",
  "Mombasa",
];

const budgets = [
  "Any budget",
  "Under KSh 7,000",
  "KSh 7,000 - 10,000",
  "KSh 10,000 - 13,000",
  "Above KSh 13,000",
];

function formatBudget(value: number) {
  return new Intl.NumberFormat("en-KE").format(value);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getCompatibility(profile: RoommateProfile) {
  const score =
    82 +
    Math.min(profile.interests.length * 2, 8) +
    Math.min(profile.lifestyle.length, 5);

  return Math.min(score, 96);
}

export default function RoommatesPage() {
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [budget, setBudget] = useState("Any budget");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageVisible(true);
    }, 80);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const response = await fetch("/api/roommates", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load profiles.");
        }

        setProfiles(data.profiles ?? []);
      } catch {
        setError("We could not load roommate profiles right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesSearch =
        !query ||
        profile.name.toLowerCase().includes(query) ||
        profile.username.toLowerCase().includes(query) ||
        profile.school.toLowerCase().includes(query) ||
        profile.location.toLowerCase().includes(query) ||
        profile.interests.some((interest) =>
          interest.toLowerCase().includes(query),
        );

      const matchesLocation =
        location === "All locations" || profile.location === location;

      let matchesBudget = true;

      if (budget === "Under KSh 7,000") {
        matchesBudget = profile.budget < 7000;
      }

      if (budget === "KSh 7,000 - 10,000") {
        matchesBudget = profile.budget >= 7000 && profile.budget <= 10000;
      }

      if (budget === "KSh 10,000 - 13,000") {
        matchesBudget = profile.budget > 10000 && profile.budget <= 13000;
      }

      if (budget === "Above KSh 13,000") {
        matchesBudget = profile.budget > 13000;
      }

      return matchesSearch && matchesLocation && matchesBudget;
    });
  }, [profiles, search, location, budget]);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-black">
      <Navbar />

      <section className="relative overflow-hidden border-b border-black/10 bg-[#f7f7f5]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-black/[0.025] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-black/[0.025] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div
            className={`max-w-4xl transition-all duration-1000 ${
              pageVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              Find your people
            </p>

            <h1 className="text-5xl font-black tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Roommates,
              <br />
              <span className="inline-block text-black/30 transition-transform duration-700 hover:translate-x-2">
                done better.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/55">
              Discover students looking for a roommate based on location,
              budget, lifestyle and interests.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-black/55 backdrop-blur-sm">
                Location matched
              </div>

              <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-black/55 backdrop-blur-sm">
                Budget aware
              </div>

              <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold text-black/55 backdrop-blur-sm">
                Lifestyle based
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative transition-transform duration-300 focus-within:-translate-y-0.5">
              <svg
                className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, school, location or interest..."
                className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] py-4 pl-13 pr-5 text-sm outline-none transition-all duration-300 focus:border-black focus:bg-white focus:shadow-lg focus:shadow-black/5"
              />
            </div>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 text-sm font-medium outline-none transition-all duration-300 hover:border-black/20 focus:border-black focus:bg-white focus:shadow-lg focus:shadow-black/5"
            >
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 text-sm font-medium outline-none transition-all duration-300 hover:border-black/20 focus:border-black focus:bg-white focus:shadow-lg focus:shadow-black/5"
            >
              {budgets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div
          className={`mb-10 flex items-end justify-between gap-6 transition-all duration-700 ${
            pageVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              Available profiles
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              {loading
                ? "Finding students..."
                : `${filteredProfiles.length} ${
                    filteredProfiles.length === 1
                      ? "student"
                      : "students"
                  }`}
            </h2>
          </div>

          {!loading && profiles.length > 0 && (
            <p className="hidden text-sm text-black/40 sm:block">
              Real profiles from the Baraka Nest community
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[430px] animate-pulse rounded-[2rem] border border-black/10 bg-[#f7f7f5]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="animate-[fadeIn_0.5s_ease-out] rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-lg active:scale-95"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProfiles.length === 0 && (
          <div className="animate-[fadeIn_0.5s_ease-out] rounded-[2rem] border border-black/10 bg-[#f7f7f5] px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 animate-[float_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-black text-xl font-black text-white">
              BN
            </div>

            <h3 className="mt-6 text-2xl font-black">
              No roommate profiles found.
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
              Try changing your search or filters. If you are new here, you
              can also create the first profile.
            </p>

            <Link
              href="/roommates/create"
              className="mt-7 inline-flex rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-black/80 hover:shadow-xl active:scale-95"
            >
              Create a profile
            </Link>
          </div>
        )}

        {!loading && !error && filteredProfiles.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, index) => {
              const compatibility = getCompatibility(profile);

              return (
                <Link
                  key={profile.id}
                  href={`/roommates/${profile.id}`}
                  style={{
                    animationDelay: `${index * 90}ms`,
                  }}
                  className={`group animate-[cardIn_0.65s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden rounded-[2rem] border border-black/10 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-black/20 hover:shadow-2xl hover:shadow-black/10 ${
                    pageVisible ? "" : "opacity-0"
                  }`}
                >
                  <div className="relative overflow-hidden bg-[#f1f1ef] p-7">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-black/[0.025] transition-transform duration-700 group-hover:scale-150" />

                    <div className="relative flex items-start justify-between">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-black text-xl font-black text-white transition-all duration-500 group-hover:rotate-2 group-hover:scale-105">
                        {getInitials(profile.name)}
                      </div>

                      <div className="rounded-full bg-white px-3 py-2 text-xs font-black shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                        {compatibility}% match
                      </div>
                    </div>

                    <div className="relative mt-8">
                      <h3 className="text-2xl font-black tracking-tight">
                        {profile.name}
                      </h3>

                      <p className="mt-1 text-sm text-black/45">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  <div className="p-7">
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-5">
                        <span className="text-black/40">Age</span>
                        <span className="text-right font-semibold">
                          {profile.age}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-5">
                        <span className="text-black/40">School</span>
                        <span className="max-w-[65%] text-right font-semibold">
                          {profile.school}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-5">
                        <span className="text-black/40">Area</span>
                        <span className="text-right font-semibold">
                          {profile.location}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-5">
                        <span className="text-black/40">Budget</span>
                        <span className="text-right font-semibold">
                          KSh {formatBudget(profile.budget)}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-5">
                        <span className="text-black/40">Move in</span>
                        <span className="text-right font-semibold">
                          {profile.moveIn}
                        </span>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-black/10 pt-6">
                      <p className="text-sm leading-6 text-black/55">
                        {profile.about.length > 120
                          ? `${profile.about.slice(0, 120)}...`
                          : profile.about}
                      </p>
                    </div>

                    {profile.interests.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {profile.interests
                          .slice(0, 3)
                          .map((interest, tagIndex) => (
                            <span
                              key={interest}
                              style={{
                                transitionDelay: `${tagIndex * 40}ms`,
                              }}
                              className="rounded-full bg-[#f1f1ef] px-3 py-1.5 text-xs font-semibold text-black/60 transition-all duration-300 group-hover:-translate-y-0.5"
                            >
                              {interest}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="mt-7 flex items-center justify-between border-t border-black/10 pt-5">
                      <span className="text-sm font-bold">
                        View profile
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-black group-hover:text-white group-hover:shadow-lg">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden border-t border-black/10 bg-black text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">
                Join Baraka Nest
              </p>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Looking for someone
                <br />
                to share the journey?
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/50">
                Create your profile and let the right roommate find you.
              </p>
            </div>

            <Link
              href="/roommates/create"
              className="inline-flex w-fit rounded-full bg-white px-7 py-4 text-sm font-black text-black transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl hover:shadow-white/10 active:scale-95"
            >
              Create my profile
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="text-lg font-black tracking-tight">
              BARAKA<span className="text-black/35">NEST</span>
            </div>

            <p className="mt-1 text-xs text-black/40">
              Better student living, together.
            </p>
          </div>

          <div className="flex gap-6 text-sm font-medium text-black/50">
            <Link
              href="/houses"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:text-black"
            >
              Houses
            </Link>

            <Link
              href="/roommates"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:text-black"
            >
              Roommates
            </Link>

            <Link
              href="/login"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:text-black"
            >
              Log in
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </main>
  );
}