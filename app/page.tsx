"use client";

import { useState } from "react";
import Navbar from "./navbar";

export default function Home() {
  const [mode, setMode] = useState<"house" | "roommate">("house");

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#183b2c]">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center md:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce6dc] bg-white px-4 py-2 text-xs font-semibold text-[#426c50]">
            <span className="h-2 w-2 rounded-full bg-[#e58b45]" />
            MADE FOR CAMPUS LIVING
          </div>

          <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Find your space.
            <span className="text-[#e58b45]"> Find your people.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#68776d] sm:text-lg">
            Your next home, roommate, and campus community — all in one place.
            Less stress searching, more time living.
          </p>

          {/* Search panel */}
          <div className="mt-9 rounded-3xl border border-[#e8e9e2] bg-white p-4 shadow-[0_18px_55px_rgba(24,59,44,0.08)] sm:p-5">
            <div className="mb-5 flex rounded-full bg-[#f2f4ef] p-1">
              <button
                onClick={() => setMode("house")}
                className={`flex-1 rounded-full px-3 py-3 text-sm font-semibold transition ${
                  mode === "house"
                    ? "bg-[#183b2c] text-white shadow"
                    : "text-[#68776d]"
                }`}
              >
                Find a house
              </button>

              <button
                onClick={() => setMode("roommate")}
                className={`flex-1 rounded-full px-3 py-3 text-sm font-semibold transition ${
                  mode === "roommate"
                    ? "bg-[#183b2c] text-white shadow"
                    : "text-[#68776d]"
                }`}
              >
                Find a roommate
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-[#e8e9e2] px-4 py-3">
                <span className="block text-xs font-semibold text-[#89948b]">
                  WHERE?
                </span>

                <input
                  type="text"
                  placeholder="e.g. Juja, Kahawa..."
                  className="mt-2 w-full bg-transparent text-sm font-medium text-[#183b2c] outline-none placeholder:text-[#a2aaa3]"
                />
              </label>

              <label className="rounded-2xl border border-[#e8e9e2] px-4 py-3">
                <span className="block text-xs font-semibold text-[#89948b]">
                  {mode === "house" ? "MONTHLY BUDGET" : "YOUR BUDGET"}
                </span>

                <select className="mt-2 w-full bg-transparent text-sm font-medium text-[#183b2c] outline-none">
                  <option value="">Select budget</option>
                  <option>KSh 3,000 – 5,000</option>
                  <option>KSh 5,000 – 8,000</option>
                  <option>KSh 8,000 – 12,000</option>
                  <option>KSh 12,000+</option>
                </select>
              </label>
            </div>

            <button className="mt-4 w-full rounded-2xl bg-[#e58b45] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#cf7430]">
              {mode === "house"
                ? "Search houses →"
                : "Find my roommate →"}
            </button>
          </div>

          <p className="mt-5 text-xs text-[#89948b]">
            Built for students. Designed for better living.
          </p>
        </div>

        {/* Visual panel */}
        <div className="relative">
          <div className="absolute -left-5 top-10 h-28 w-28 rounded-full bg-[#e8d7b8] blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] bg-[#dfe8dc] p-4 sm:p-6">
            <div className="flex min-h-[390px] flex-col justify-between rounded-[1.5rem] bg-[#c8d9c5] p-6 sm:min-h-[470px] sm:p-8">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold">
                  YOUR NEXT CHAPTER
                </span>

                <span className="text-2xl">✳</span>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <div className="rounded-t-[7rem] rounded-b-3xl bg-[#f4eee2] p-5 pb-0 shadow-xl">
                  <div className="flex h-52 items-end justify-center overflow-hidden rounded-t-[5rem] bg-[#a9bea7] sm:h-64">
                    <div className="relative flex h-4/5 w-4/5 items-end justify-center rounded-t-[5rem] bg-[#e8d6b9]">
                      <div className="absolute left-5 top-8 h-16 w-16 rounded-full bg-[#f8f4eb]" />
                      <div className="absolute right-5 top-12 h-24 w-12 rounded-full bg-[#f8f4eb]" />
                      <div className="h-3/5 w-3/5 rounded-t-3xl bg-[#183b2c]" />
                    </div>
                  </div>

                  <div className="py-5 text-center">
                    <p className="text-sm font-bold">
                      A place to belong.
                    </p>

                    <p className="mt-1 text-xs text-[#68776d]">
                      Your campus life, made easier.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm">
                  <p className="text-xs text-[#68776d]">
                    A better way to
                  </p>

                  <p className="text-sm font-bold">
                    Live student life
                  </p>
                </div>

                <span className="text-3xl">⌂</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:left-0">
            <p className="text-xs text-[#89948b]">
              THE RIGHT FIT
            </p>

            <p className="mt-1 text-sm font-bold">
              Home meets community.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="explore"
        className="border-y border-[#e9e9e2] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <p className="text-2xl">⌂</p>

            <h3 className="mt-3 font-bold">
              Find a place
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#758078]">
              Explore student-friendly housing around your campus.
            </p>
          </div>

          <div>
            <p className="text-2xl">♧</p>

            <h3 className="mt-3 font-bold">
              Meet your people
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#758078]">
              Connect with potential roommates who fit your lifestyle.
            </p>
          </div>

          <div>
            <p className="text-2xl">♡</p>

            <h3 className="mt-3 font-bold">
              Feel at home
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#758078]">
              Make smarter housing decisions with useful local information.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-20 text-center"
      >
        <p className="text-xs font-bold tracking-[0.2em] text-[#e58b45]">
          YOUR CAMPUS. YOUR COMMUNITY.
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Student living should feel like a fresh start.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#758078]">
          We’re building a simpler way for students across Kenya to find
          housing and people they can call their own.
        </p>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="border-t border-[#e9e9e2] px-6 py-7"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-[#89948b] sm:flex-row">
          <p>
            © 2026 Baraka Nest. Built for student living.
          </p>

          <p>
            Find your space. Find your people.
          </p>
        </div>
      </footer>
    </main>
  );
}