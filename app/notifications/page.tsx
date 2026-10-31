"use client";

import Link from "next/link";
import Navbar from "../navbar";

export default function NotificationsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">Baraka Nest</p>
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
                <h2 className="font-bold text-[#183b2c]">Recent activity</h2>
                <p className="mt-1 text-sm text-[#718078]">
                  Your latest Baraka Nest updates.
                </p>
              </div>

              <span className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-bold text-[#d97832]">
                New
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf2ed] text-2xl">
                🔔
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#183b2c]">
                You&apos;re all caught up
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#718078]">
                New roommate requests, connections and other important updates
                will appear here.
              </p>

              <Link
                href="/roommates"
                className="mt-6 rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
              >
                Explore roommates
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}