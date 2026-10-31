"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../language-context";
import Navbar from "../../navbar";

type Person = {
  id: string;
  name: string;
  username: string;
  school: string;
  location: string;
  budget: number;
};

type Connection = {
  id: string;
  connectedAt: string;
  person: Person;
};

const translations = {
  English: {
    title: "My connections",
    subtitle: "Students you have connected with on Baraka Nest.",
    back: "← Back to roommates",
    requests: "Connection requests",
    noConnections: "You do not have any connections yet.",
    viewProfile: "View profile",
    budget: "Budget",
    location: "Location",
    connected: "Connected",
    loading: "Loading connections...",
    error: "Something went wrong. Please try again.",
    discover: "Find roommates",
  },

  Swahili: {
    title: "Connections zangu",
    subtitle: "Wanafunzi ambao mmeconnect kupitia Baraka Nest.",
    back: "← Rudi kwa roommates",
    requests: "Connection requests",
    noConnections: "Bado hauna connections.",
    viewProfile: "Angalia profile",
    budget: "Budget",
    location: "Eneo",
    connected: "Mmeconnect",
    loading: "Inapakia connections...",
    error: "Kuna tatizo. Jaribu tena.",
    discover: "Tafuta roommates",
  },

  Sheng: {
    title: "Connections zangu",
    subtitle: "Wasee mmeshaconnect kupitia Baraka Nest.",
    back: "← Rudi kwa roommates",
    requests: "Connection requests",
    noConnections: "Bado huna connections.",
    viewProfile: "View profile",
    budget: "Budget",
    location: "Area",
    connected: "Connected",
    loading: "Inaload connections...",
    error: "Kuna noma. Jaribu tena.",
    discover: "Tafuta roommates",
  },
};

type Language = keyof typeof translations;

export default function RoommateConnectionsPage() {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchConnections() {
      try {
        const response = await fetch("/api/roommates/requests", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          setError(data.error || t.error);
          setLoading(false);
          return;
        }

        setConnections(data.connections ?? []);
        setLoading(false);
      } catch (requestError) {
        console.error("Connections loading error:", requestError);

        if (active) {
          setError(t.error);
          setLoading(false);
        }
      }
    }

    fetchConnections();

    return () => {
      active = false;
    };
  }, [t.error]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#183b2c]">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/roommates"
              className="text-sm font-semibold text-[#68776d] transition hover:text-[#e58b45]"
            >
              {t.back}
            </Link>

            <Link
              href="/roommates/requests"
              className="rounded-2xl border border-[#d9dfd7] bg-white px-4 py-2.5 text-sm font-bold text-[#183b2c] transition hover:bg-[#f5f7f2]"
            >
              {t.requests}
            </Link>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {t.title}
                </h1>

                <p className="mt-2 text-[#68776d]">{t.subtitle}</p>
              </div>

              <div className="rounded-2xl bg-[#183b2c] px-5 py-3 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b9cbbf]">
                  {t.connected}
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {connections.length}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-[#e3e7df] bg-white p-10 text-center text-sm text-[#68776d]">
              {t.loading}
            </div>
          ) : connections.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-[#d9dfd7] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dfe8dc] text-2xl">
                ✦
              </div>

              <h2 className="mt-5 text-xl font-bold">
                {t.noConnections}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#68776d]">
                Start discovering students who match your budget,
                location and lifestyle.
              </p>

              <Link
                href="/roommates"
                className="mt-6 inline-flex rounded-2xl bg-[#183b2c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285640]"
              >
                {t.discover}
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {connections.map((connection) => {
                const person = connection.person;

                return (
                  <article
                    key={connection.id}
                    className="rounded-3xl border border-[#e3e7df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#dfe8dc] text-xl font-bold text-[#183b2c]">
                          {person.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-[#183b2c]">
                            {person.name}
                          </h2>

                          <p className="truncate text-sm text-[#68776d]">
                            @{person.username}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#dfeee3] px-3 py-1.5 text-xs font-bold text-[#285640]">
                        {t.connected}
                      </span>
                    </div>

                    <p className="mt-5 text-sm font-medium text-[#526258]">
                      {person.school}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f5f7f2] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                          {t.budget}
                        </p>

                        <p className="mt-1 font-bold text-[#183b2c]">
                          KSh {person.budget.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f5f7f2] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                          {t.location}
                        </p>

                        <p className="mt-1 font-bold text-[#183b2c]">
                          {person.location}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/roommates/${person.id}`}
                      className="mt-5 flex w-full items-center justify-center rounded-2xl border border-[#d9dfd7] px-4 py-3 text-sm font-bold text-[#183b2c] transition hover:bg-[#f5f7f2]"
                    >
                      {t.viewProfile}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}