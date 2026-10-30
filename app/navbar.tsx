"use client";

import Link from "next/link";
import { useState } from "react";

type Language = "English" | "Swahili" | "Sheng";

const translations = {
  English: {
    explore: "Explore",
    howItWorks: "How it works",
    about: "About us",
    login: "Log in",
    getStarted: "Get started",
    language: "Language",
  },
  Swahili: {
    explore: "Gundua",
    howItWorks: "Jinsi inavyofanya kazi",
    about: "Kuhusu sisi",
    login: "Ingia",
    getStarted: "Anza sasa",
    language: "Lugha",
  },
  Sheng: {
    explore: "Angalia keja",
    howItWorks: "Inawork aje",
    about: "Kutuhusu",
    login: "Ingia",
    getStarted: "Tuanzishe",
    language: "Lugha",
  },
};

export default function Navbar() {
  const [language, setLanguage] = useState<Language>("English");

  const t = translations[language];

  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-bold tracking-tight text-[#183b2c]"
      >
        Baraka<span className="text-[#e58b45]">Nest.</span>
      </Link>

      {/* Navigation */}
      <div className="hidden items-center gap-8 text-sm font-medium text-[#183b2c] md:flex">
        <a href="#explore" className="hover:text-[#e58b45]">
          {t.explore}
        </a>

        <a href="#how-it-works" className="hover:text-[#e58b45]">
          {t.howItWorks}
        </a>

        <a href="#about" className="hover:text-[#e58b45]">
          {t.about}
        </a>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language selector */}
        <select
          id="language"
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as Language)
          }
          aria-label={t.language}
          className="block rounded-full border border-[#e3e7df] bg-white px-3 py-2.5 text-sm font-semibold text-[#183b2c] outline-none focus:border-[#183b2c]"
        >
          <option value="English">English</option>
          <option value="Swahili">Kiswahili</option>
          <option value="Sheng">Sheng</option>
        </select>

        {/* Login */}
        <button
          type="button"
          className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[#183b2c] hover:bg-[#f5f7f2] sm:block"
        >
          {t.login}
        </button>

        {/* Get started */}
        <button
          type="button"
          className="rounded-full bg-[#183b2c] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#285640] sm:px-5 sm:text-sm"
        >
          {t.getStarted}
        </button>
      </div>
    </nav>
  );
}