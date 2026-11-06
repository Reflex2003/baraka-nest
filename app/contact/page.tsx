"use client";

import Link from "next/link";
import Navbar from "../navbar";
import SocialIcons from "@/components/SocialIcons";
import { useLanguage } from "../language-context";
import { adminContactChannels, freeListingLink } from "@/lib/contact";

const copy = {
  English: {
    eyebrow: "Here to help",
    title: "Connect with Baraka Nest",
    description:
      "Ask a question, share feedback, or list student housing for free. Choose the channel that works for you.",
    listing: "List your place for free",
    socials: "Connect with Admin",
    email: "Admin Email",
    emailDescription: "Copy the email or open your mail app directly.",
    browse: "Browse student homes",
  },

  Swahili: {
    eyebrow: "Tuko hapa kusaidia",
    title: "Wasiliana na Baraka Nest",
    description:
      "Uliza swali, tuma maoni, au tangaza makazi ya wanafunzi bila malipo. Chagua njia inayokufaa.",
    listing: "Tangaza nyumba bila malipo",
    socials: "Wasiliana na Admin",
    email: "Barua pepe ya Admin",
    emailDescription:
      "Copy email au fungua mail app yako moja kwa moja.",
    browse: "Tazama makazi ya wanafunzi",
  },

  Sheng: {
    eyebrow: "Tuko hapa kukusaidia",
    title: "Connect na Baraka Nest",
    description:
      "Uliza swali, drop feedback, ama list student housing free. Chagua channel inakufaa.",
    listing: "List keja free",
    socials: "Connect na Admin",
    email: "Admin Email",
    emailDescription:
      "Copy email ama fungua mail app direct.",
    browse: "Saka student homes",
  },
};

export default function ContactPage() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-[#fafaf7] text-[#183b2c]">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#df8750]">
            {t.eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
            {t.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#69766d] sm:text-lg">
            {t.description}
          </p>

          <a
            href={freeListingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#183b2c] px-7 py-3 text-sm font-extrabold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#285640] hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183b2c]"
          >
            {t.listing}
            <span className="ml-2">↗</span>
          </a>
        </div>

        <div className="mt-12 rounded-[2rem] border border-[#e3e9e1] bg-white p-6 shadow-[0_20px_60px_rgba(24,59,44,0.07)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#df8750]">
                {t.socials}
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                Baraka Nest Admin
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#718077]">
                Reach us directly through WhatsApp, Instagram, Facebook,
                Telegram or email.
              </p>
            </div>

            <SocialIcons />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminContactChannels.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              target={
                channel.href.startsWith("mailto:")
                  ? undefined
                  : "_blank"
              }
              rel={
                channel.href.startsWith("mailto:")
                  ? undefined
                  : "noopener noreferrer"
              }
              className="group rounded-3xl border border-[#e3e9e1] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#b9cbb8] hover:shadow-[0_16px_40px_rgba(24,59,44,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#df8750]">
                  {channel.label}
                </span>

                <span className="text-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-[#183b2c]">
                {channel.detail}
              </h3>

              <p className="mt-2 break-all text-sm text-[#718077]">
                {channel.id === "email"
                  ? "ianmorgan107@gmail.com"
                  : channel.id === "telegram"
                    ? "@ian_morgan"
                    : channel.label}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/houses"
            className="inline-flex min-h-11 items-center text-sm font-bold text-[#526258] underline decoration-[#cfd8ce] underline-offset-4 transition hover:text-[#183b2c]"
          >
            {t.browse} →
          </Link>
        </div>
      </section>
    </main>
  );
}