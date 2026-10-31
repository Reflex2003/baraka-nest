"use client";

import Link from "next/link";
import Navbar from "../navbar";

export default function ProfilePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#e58b45]">Baraka Nest</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183b2c]">
              Your Profile
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#183b2c] text-2xl font-bold text-white">
                U
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#183b2c]">
                Your profile
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                Complete your details to get better roommate matches.
              </p>

              <Link
                href="/roommates/create"
                className="mt-6 inline-block rounded-full bg-[#183b2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285640]"
              >
                Edit profile
              </Link>
            </section>

            <section className="rounded-3xl bg-white p-7 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-bold text-[#183b2c]">
                Profile progress
              </h2>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
                <div className="h-full w-[40%] rounded-full bg-[#e58b45]" />
              </div>

              <p className="mt-3 text-sm text-[#718078]">
                40% complete
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ["👤", "Basic information"],
                  ["🎓", "School details"],
                  ["📍", "Location"],
                  ["🏠", "Housing preferences"],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[#edf0eb] p-4"
                  >
                    <span className="text-xl">{icon}</span>
                    <p className="mt-2 text-sm font-semibold text-[#183b2c]">
                      {label}
                    </p>
                    <p className="mt-1 text-xs text-[#8a948d]">
                      Add details
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}