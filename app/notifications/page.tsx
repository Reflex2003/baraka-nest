"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../navbar";

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

function formatDate(value: string) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPersonName(person?: Person) {
  return person?.name || person?.username || "A student";
}

function buildActivities(data: RequestsResponse): Activity[] {
  const activities: Activity[] = [];

  data.incoming?.forEach((request) => {
    if (request.status === "pending") {
      activities.push({
        id: `incoming-${request.id}`,
        title: "New roommate request",
        description: `${getPersonName(request.sender)} sent you a connection request.`,
        date: request.createdAt,
        type: "incoming",
        href: "/roommates/requests",
      });
    }

    if (request.status === "declined") {
      activities.push({
        id: `declined-${request.id}`,
        title: "Request declined",
        description: `Your request to ${getPersonName(request.sender)} was declined.`,
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
        title: "Request sent",
        description: `Your connection request to ${getPersonName(request.receiver)} is awaiting a response.`,
        date: request.createdAt,
        type: "sent",
        href: "/roommates/requests",
      });
    }

    if (request.status === "declined") {
      activities.push({
        id: `sent-declined-${request.id}`,
        title: "Request declined",
        description: `${getPersonName(request.receiver)} declined your connection request.`,
        date: request.createdAt,
        type: "declined",
        href: "/roommates/requests",
      });
    }
  });

  data.connections?.forEach((connection) => {
    activities.push({
      id: `connection-${connection.id}`,
      title: "New connection",
      description: `You are now connected with ${getPersonName(connection.person)}.`,
      date: connection.connectedAt,
      type: "accepted",
      href: "/roommates/connections",
    });
  });

  return activities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function ActivityIcon({ type }: { type: Activity["type"] }) {
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/roommates/requests", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not load your activity.");
        }

        const data: RequestsResponse = await response.json();

        if (!active) return;

        setActivities(buildActivities(data));
      } catch {
        if (active) {
          setError("We couldn't load your notifications. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivities();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">
              Baraka Nest
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c] sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-[#647067]">
              Stay updated on your roommate activity.
            </p>
          </div>

          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#edf0eb] px-6 py-5">
              <div>
                <h2 className="font-bold text-[#183b2c]">
                  Recent activity
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  Your latest Baraka Nest updates.
                </p>
              </div>

              {!loading && !error && activities.length > 0 && (
                <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-bold text-[#d97832]">
                  {activities.length} updates
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5ebe5] border-t-[#183b2c]" />

                <p className="mt-4 text-sm text-[#718078]">
                  Loading your activity...
                </p>
              </div>
            ) : error ? (
              <div className="px-6 py-20 text-center">
                <p className="font-semibold text-red-600">{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                >
                  Try again
                </button>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2ed] text-2xl">
                  🔔
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#183b2c]">
                  You are all caught up
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#718078]">
                  New roommate requests and connections will appear here.
                </p>

                <Link
                  href="/roommates"
                  className="mt-6 rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
                >
                  Explore roommates
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#edf0eb]">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="flex items-center gap-4 px-6 py-5 transition hover:bg-[#f9faf7]"
                  >
                    <ActivityIcon type={activity.type} />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#183b2c]">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[#718078]">
                        {activity.description}
                      </p>

                      <p className="mt-2 text-xs font-medium text-[#a0aaa2]">
                        {formatDate(activity.date)}
                      </p>
                    </div>

                    <span className="text-lg text-[#a0aaa2]">›</span>
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