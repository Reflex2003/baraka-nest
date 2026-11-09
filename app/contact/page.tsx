"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import SocialIcons from "@/components/SocialIcons";
import ProfileImageViewer from "@/components/ProfileImageViewer";
import { useLanguage } from "../language-context";
import {
  freeListingLink,
} from "@/lib/contact";

type AdminProfile = {
  name: string;
  image: string | null;
};

const copy = {
  English: {
    eyebrow: "Here to help",
    title: "Connect with Baraka Nest",
    description:
      "Ask a question, share feedback, or list student housing for free. Choose the channel that works for you.",
    listing: "List your place for free",
    socials: "Connect with Admin",
    browse: "Browse student homes",
    adminBio:
      "Need a website, app or a whole system? I’m Ian, a young IT technician and full-stack developer. I build and customise digital solutions at student-friendly rates. Your idea can leave the notes app without your wallet filing a complaint. Let’s make it work.",
  },

  Swahili: {
    eyebrow: "Tuko hapa kusaidia",
    title: "Wasiliana na Baraka Nest",
    description:
      "Uliza swali, tuma maoni, au tangaza makazi ya wanafunzi bila malipo. Chagua njia inayokufaa.",
    listing: "Tangaza nyumba bila malipo",
    socials: "Wasiliana na Admin",
    browse: "Tazama makazi ya wanafunzi",
    adminBio:
      "Unahitaji website, app ama system nzima? Mimi ni Ian, IT technician kijana na full-stack developer. Natengeneza na kurekebisha digital solutions kwa bei friendly. Idea yako inaweza kutoka kwa notes bila wallet yako kuanza kulalamika. Tuijenge iwe inafanya kazi.",
  },

  Sheng: {
    eyebrow: "Tuko hapa kukusaidia",
    title: "Connect na Baraka Nest",
    description:
      "Uliza swali, drop feedback, ama list student housing free. Chagua channel inakufaa.",
    listing: "List keja free",
    socials: "Connect na Admin",
    browse: "Saka student homes",
    adminBio:
      "Unahitaji website, app ama system mzima? Mimi ni Ian, young IT technician na full-stack developer. Nabuild na kucustomize digital solutions kwa bei friendly. Idea yako itoke kwa notes bila wallet yako kuanza kulalamika. Tuifanye kazi.",
  },
};

export default function ContactPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [adminProfile, setAdminProfile] =
    useState<AdminProfile | null>(null);
  const adminImage = adminProfile?.image || "/admin-profile.jpg";

  useEffect(() => {
    let cancelled = false;

    async function loadAdminProfile() {
      try {
        const response = await fetch(
          "/api/admin/profile",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const result =
          (await response.json()) as AdminProfile;

        if (!cancelled) {
          setAdminProfile(result);
        }
      } catch {
        // The contact page still works with the fallback avatar.
      }
    }

    void loadAdminProfile();

    return () => {
      cancelled = true;
    };
  }, []);

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
            <div className="flex items-center gap-4">
              <ProfileImageViewer src={adminImage} alt="Baraka Nest admin profile picture" className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-[#eaf2e8] bg-[#183b2c] shadow-sm">
                <Image src={adminImage} alt="Baraka Nest admin profile" fill sizes="64px" unoptimized className="object-cover object-[center_28%]" />
              </ProfileImageViewer>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#df8750]">
                  {t.socials}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                  Baraka Nest Admin
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#718077]">
                  {t.adminBio}
                </p>
              </div>
            </div>

            <SocialIcons />
          </div>
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
