"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../navbar";
import { useLanguage } from "../language-context";

type Person = {
  id: string;
  name?: string;
  username?: string;
  school?: string;
  location?: string;
};

type Request = {
  id: string;
  status: string;
  createdAt: string;
  sender: Person;
  receiver: Person;
};

type Connection = {
  id: string;
  connectedAt: string;
  person: Person;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "incoming" | "sent" | "accepted" | "declined";
  href: string;
};

type RequestsResponse = {
  incoming: Request[];
  sent: Request[];
  connections: Connection[];
};

const translations = {
  English: {
    brand: "Baraka Nest",
    title: "Notifications",
    subtitle: "Stay updated on your roommate activity.",
    recentActivity: "Recent activity",
    recentSubtitle: "Your latest Baraka Nest updates.",
    updates: "updates",
    loading: "Loading your activity...",
    error:
      "We couldn't load your notifications. Please try again.",
    tryAgain: "Try again",
    allCaughtUp: "You are all caught up",
    emptyText:
      "New roommate requests and connections will appear here.",
    explore: "Explore roommates",

    incomingTitle: "New roommate request",
    incomingDescription:
      "sent you a connection request.",

    sentTitle: "Request sent",
    sentDescription:
      "Your connection request to",
    sentWaiting:
      "is awaiting a response.",

    declinedTitle: "Request declined",
    yourRequestTo: "Your request to",
    wasDeclined: "was declined.",
    declinedYourRequest:
      "declined your connection request.",

    connectionTitle: "New connection",
    connectedWith: "You are now connected with",

    recently: "Recently",
  },

  Swahili: {
    brand: "Baraka Nest",
    title: "Notifications",
    subtitle:
      "Pata taarifa kuhusu shughuli zako za roommate.",
    recentActivity: "Shughuli za hivi karibuni",
    recentSubtitle:
      "Updates zako za hivi karibuni za Baraka Nest.",
    updates: "updates",
    loading: "Inapakia shughuli zako...",
    error:
      "Tumeshindwa kupakia notifications zako. Tafadhali jaribu tena.",
    tryAgain: "Jaribu tena",
    allCaughtUp: "Uko updated kabisa",
    emptyText:
      "Maombi mapya ya roommate na connections zitaonekana hapa.",
    explore: "Tafuta roommates",

    incomingTitle: "Ombi jipya la roommate",
    incomingDescription:
      "amekutumia ombi la connection.",

    sentTitle: "Ombi limetumwa",
    sentDescription:
      "Ombi lako la connection kwa",
    sentWaiting:
      "bado linasubiri jibu.",

    declinedTitle: "Ombi limekataliwa",
    yourRequestTo: "Ombi lako kwa",
    wasDeclined: "limekataliwa.",
    declinedYourRequest:
      "amekataa ombi lako la connection.",

    connectionTitle: "Connection mpya",
    connectedWith: "Sasa umeconnect na",

    recently: "Hivi karibuni",
  },

  Sheng: {
    brand: "Baraka Nest",
    title: "Notifications",
    subtitle:
      "Stay updated na roommate activity yako.",
    recentActivity: "Activity ya hivi majuzi",
    recentSubtitle:
      "Latest Baraka Nest updates zako.",
    updates: "updates",
    loading: "Inaload activity yako...",
    error:
      "Tumeshindwa kuload notifications zako. Jaribu tena.",
    tryAgain: "Jaribu tena",
    allCaughtUp: "Uko sorted, hakuna mpya",
    emptyText:
      "Roommate requests na connections mpya zitaonekana hapa.",
    explore: "Saka roommates",

    incomingTitle: "Roommate request mpya",
    incomingDescription:
      "amekutumia connection request.",

    sentTitle: "Request imetumwa",
    sentDescription:
      "Connection request yako kwa",
    sentWaiting:
      "bado iko pending.",

    declinedTitle: "Request imekataliwa",
    yourRequestTo: "Request yako kwa",
    wasDeclined: "imekataliwa.",
    declinedYourRequest:
      "amekataa connection request yako.",

    connectionTitle: "Connection mpya",
    connectedWith: "Sasa umeconnect na",

    recently: "Juzi hivi",
  },
};

type Language = keyof typeof translations;

function formatDate(
  value: string,
  recentlyText: string,
) {
  if (!value) {
    return recentlyText;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return recentlyText;
  }

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPersonName(person?: Person) {
  return person?.name || person?.username || "A student";
}

function buildActivities(
  data: RequestsResponse,
  t: (typeof translations)["English"],
): Activity[] {
  const activities: Activity[] = [];

  data.incoming?.forEach((request) => {
    if (request.status === "pending") {
      activities.push({
        id: `incoming-${request.id}`,
        title: t.incomingTitle,
        description: `${getPersonName(
          request.sender,
        )} ${t.incomingDescription}`,
        date: request.createdAt,
        type: "incoming",
        href: "/roommates/requests",
      });
    }

    if (request.status === "declined") {
      activities.push({
        id: `declined-${request.id}`,
        title: t.declinedTitle,
        description: `${t.yourRequestTo} ${getPersonName(
          request.sender,
        )} ${t.wasDeclined}`,
        date: request.createdAt,
        type: "declined",
        href: "/roommates/requests",
      });
    }
  });

  data.sent?.forEach((request) => {
    if (request.status === "pending") {
      activities.push({
        id: `sent-${request.id}`,
        title: t.sentTitle,
        description: `${t.sentDescription} ${getPersonName(
          request.receiver,
        )} ${t.sentWaiting}`,
        date: request.createdAt,
        type: "sent",
        href: "/roommates/requests",
      });
    }

    if (request.status === "declined") {
      activities.push({
        id: `sent-declined-${request.id}`,
        title: t.declinedTitle,
        description: `${getPersonName(
          request.receiver,
        )} ${t.declinedYourRequest}`,
        date: request.createdAt,
        type: "declined",
        href: "/roommates/requests",
      });
    }
  });

  data.connections?.forEach((connection) => {
    activities.push({
      id: `connection-${connection.id}`,
      title: t.connectionTitle,
      description: `${t.connectedWith} ${getPersonName(
        connection.person,
      )}.`,
      date: connection.connectedAt,
      type: "accepted",
      href: "/roommates/connections",
    });
  });

  return activities.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime(),
  );
}

function ActivityIcon({
  type,
}: {
  type: Activity["type"];
}) {
  const styles = {
    incoming: "bg-orange-100 text-orange-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
  };

  const icons = {
    incoming: "📩",
    sent: "📤",
    accepted: "🤝",
    declined: "✕",
  };

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${styles[type]}`}
    >
      {icons[type]}
    </div>
  );
}

export default function NotificationsPage() {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [activities, setActivities] = useState<Activity[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/roommates/requests",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Could not load your activity.",
          );
        }

        const data: RequestsResponse =
          await response.json();

        if (!active) {
          return;
        }

        const currentTranslations =
          translations[language as Language];

        setActivities(
          buildActivities(
            data,
            currentTranslations,
          ),
        );
      } catch {
        if (active) {
          setError(
            "We couldn't load your notifications. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      active = false;
    };
  }, [language]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">
              {t.brand}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c] sm:text-4xl">
              {t.title}
            </h1>

            <p className="mt-2 text-[#647067]">
              {t.subtitle}
            </p>
          </div>

          {/* Main notifications card */}
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

            {/* Section header */}
            <div className="flex items-center justify-between border-b border-[#edf0eb] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#183b2c]">
                  {t.recentActivity}
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  {t.recentSubtitle}
                </p>
              </div>

              {!loading &&
                !error &&
                activities.length > 0 && (
                  <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-bold text-[#d97832]">
                    {activities.length} {t.updates}
                  </span>
                )}
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5ebe5] border-t-[#183b2c]" />

                <p className="mt-4 text-sm text-[#718078]">
                  {t.loading}
                </p>
              </div>
            ) : error ? (

              /* Error */
              <div className="px-6 py-20 text-center">
                <p className="font-semibold text-red-600">
                  {t.error}
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-5 rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                >
                  {t.tryAgain}
                </button>
              </div>

            ) : activities.length === 0 ? (

              /* Empty state */
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2ed] text-2xl">
                  🔔
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#183b2c]">
                  {t.allCaughtUp}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#718078]">
                  {t.emptyText}
                </p>

                <Link
                  href="/roommates"
                  className="mt-6 rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                >
                  {t.explore}
                </Link>
              </div>

            ) : (

              /* Activity list */
              <div className="divide-y divide-[#edf0eb]">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="flex items-center gap-4 px-6 py-5 transition hover:bg-[#f9faf7]"
                  >
                    <ActivityIcon
                      type={activity.type}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#183b2c]">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[#718078]">
                        {activity.description}
                      </p>

                      <p className="mt-2 text-xs font-medium text-[#a0aaa2]">
                        {formatDate(
                          activity.date,
                          t.recently,
                        )}
                      </p>
                    </div>

                    <span className="text-lg text-[#a0aaa2]">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            )}

          </section>
        </div>
      </main>
    </>
  );
}