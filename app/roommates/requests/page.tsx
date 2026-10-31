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

type ConnectionRequest = {
  id: string;
  status: string;
  createdAt: string;
  sender: Person;
  receiver: Person;
};

const translations = {
  English: {
    title: "Connection requests",
    subtitle: "Manage students who want to connect with you.",
    back: "← Back to roommates",
    incoming: "Incoming requests",
    sent: "Sent requests",
    noIncoming: "No incoming requests yet.",
    noSent: "You have not sent any requests yet.",
    accept: "Accept",
    decline: "Decline",
    accepted: "Accepted",
    declined: "Declined",
    pending: "Pending",
    accepting: "Accepting...",
    declining: "Declining...",
    loading: "Loading requests...",
    error: "Something went wrong. Please try again.",
    viewProfile: "View profile",
    budget: "Budget",
    location: "Location",
  },

  Swahili: {
    title: "Maombi ya connection",
    subtitle: "Manage wanafunzi wanataka kuconnect na wewe.",
    back: "← Rudi kwa roommates",
    incoming: "Maombi uliyopewa",
    sent: "Maombi umetuma",
    noIncoming: "Hakuna maombi bado.",
    noSent: "Bado hujatuma request yoyote.",
    accept: "Kubali",
    decline: "Kataa",
    accepted: "Imekubaliwa",
    declined: "Imekataliwa",
    pending: "Inasubiri",
    accepting: "Inakubali...",
    declining: "Inakataa...",
    loading: "Inapakia requests...",
    error: "Kuna tatizo. Jaribu tena.",
    viewProfile: "Angalia profile",
    budget: "Budget",
    location: "Eneo",
  },

  Sheng: {
    title: "Connection requests",
    subtitle: "Manage wasee wanadai kuconnect na wewe.",
    back: "← Rudi kwa roommates",
    incoming: "Requests umepewa",
    sent: "Requests umetuma",
    noIncoming: "Hakuna request bado.",
    noSent: "Bado hujatuma request.",
    accept: "Kubali",
    decline: "Kataa",
    accepted: "Accepted",
    declined: "Declined",
    pending: "Pending",
    accepting: "Inaccept...",
    declining: "Inadecline...",
    loading: "Inaload requests...",
    error: "Kuna noma. Jaribu tena.",
    viewProfile: "View profile",
    budget: "Budget",
    location: "Area",
  },
};

type Language = keyof typeof translations;

export default function RoommateRequestsPage() {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [sent, setSent] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updatingAction, setUpdatingAction] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchRequests() {
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

        setIncoming(data.incoming ?? []);
        setSent(data.sent ?? []);
        setLoading(false);
      } catch (requestError) {
        console.error("Requests loading error:", requestError);

        if (active) {
          setError(t.error);
          setLoading(false);
        }
      }
    }

    fetchRequests();

    return () => {
      active = false;
    };
  }, [t.error]);

  async function updateRequest(
    requestId: string,
    action: "accept" | "decline",
  ) {
    setUpdatingId(requestId);
    setUpdatingAction(action);
    setError("");

    try {
      const response = await fetch("/api/roommates/requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.error);
        setUpdatingId("");
        setUpdatingAction("");
        return;
      }

      setIncoming((current) =>
        current.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: data.status,
              }
            : item,
        ),
      );

      setUpdatingId("");
      setUpdatingAction("");
    } catch (requestError) {
      console.error("Request update error:", requestError);

      setError(t.error);
      setUpdatingId("");
      setUpdatingAction("");
    }
  }

  function getStatusLabel(status: string) {
    if (status === "accepted") {
      return t.accepted;
    }

    if (status === "declined") {
      return t.declined;
    }

    return t.pending;
  }

  function getStatusClass(status: string) {
    if (status === "accepted") {
      return "bg-[#dfeee3] text-[#285640]";
    }

    if (status === "declined") {
      return "bg-[#f5e3e1] text-[#9b3d35]";
    }

    return "bg-[#f5ead7] text-[#8a5a20]";
  }

  function RequestCard({
    item,
    incomingRequest,
  }: {
    item: ConnectionRequest;
    incomingRequest: boolean;
  }) {
    const person = incomingRequest ? item.sender : item.receiver;

    return (
      <article className="rounded-3xl border border-[#e3e7df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#dfe8dc] text-xl font-bold text-[#183b2c]">
              {person.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-[#183b2c]">
                {person.name}
              </h3>

              <p className="truncate text-sm text-[#68776d]">
                @{person.username}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
              item.status,
            )}`}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

        <p className="mt-4 text-sm text-[#68776d]">{person.school}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/roommates/${person.id}`}
            className="rounded-2xl border border-[#d9dfd7] px-4 py-2.5 text-sm font-bold text-[#183b2c] transition hover:bg-[#f5f7f2]"
          >
            {t.viewProfile}
          </Link>

          {incomingRequest && item.status === "pending" && (
            <>
              <button
                type="button"
                disabled={updatingId === item.id}
                onClick={() => updateRequest(item.id, "accept")}
                className="rounded-2xl bg-[#183b2c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#285640] disabled:cursor-wait disabled:opacity-60"
              >
                {updatingId === item.id && updatingAction === "accept"
                  ? t.accepting
                  : t.accept}
              </button>

              <button
                type="button"
                disabled={updatingId === item.id}
                onClick={() => updateRequest(item.id, "decline")}
                className="rounded-2xl bg-[#f4e8e6] px-4 py-2.5 text-sm font-bold text-[#9b3d35] transition hover:bg-[#edd8d5] disabled:cursor-wait disabled:opacity-60"
              >
                {updatingId === item.id && updatingAction === "decline"
                  ? t.declining
                  : t.decline}
              </button>
            </>
          )}
        </div>
      </article>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#183b2c]">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/roommates"
            className="text-sm font-semibold text-[#68776d] transition hover:text-[#e58b45]"
          >
            {t.back}
          </Link>

          <div className="mt-6">
            <h1 className="text-4xl font-bold tracking-tight">
              {t.title}
            </h1>

            <p className="mt-2 text-[#68776d]">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 rounded-3xl border border-[#e3e7df] bg-white p-8 text-center text-sm text-[#68776d]">
              {t.loading}
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{t.incoming}</h2>

                  <span className="rounded-full bg-[#dfe8dc] px-3 py-1 text-xs font-bold">
                    {incoming.length}
                  </span>
                </div>

                {incoming.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#d9dfd7] bg-white p-8 text-center text-sm text-[#68776d]">
                    {t.noIncoming}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incoming.map((item) => (
                      <RequestCard
                        key={item.id}
                        item={item}
                        incomingRequest={true}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{t.sent}</h2>

                  <span className="rounded-full bg-[#f1f4ef] px-3 py-1 text-xs font-bold text-[#526258]">
                    {sent.length}
                  </span>
                </div>

                {sent.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#d9dfd7] bg-white p-8 text-center text-sm text-[#68776d]">
                    {t.noSent}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sent.map((item) => (
                      <RequestCard
                        key={item.id}
                        item={item}
                        incomingRequest={false}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}