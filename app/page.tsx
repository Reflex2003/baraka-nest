"use client";

import Link from "next/link";
import { useLanguage, type Language } from "./language-context";
import Navbar from "./navbar";

const translations = {
  English: {
    built: "Built for students across Kenya",
    hero: "Find a place",
    heroMuted: "that feels right.",
    heroText:
      "Baraka Nest brings student houses and roommates together in one simple place — so finding where you belong does not have to be stressful.",
    exploreHouses: "Explore houses",
    findRoommate: "Find a roommate",
    findPlace: "Find my place",
    designed: "Designed around student life",

    houses: "Houses",
    roommates: "Roommates",
    login: "Log in",
    getStarted: "Get started",

    yourNextHome: "Your next home",
    startsHere: "Starts here.",
    explore: "Explore →",
    discover: "DISCOVER",
    idealRoommate:
      "Your ideal roommate might be closer than you think.",

    findHome: "Find a home",
    findHomeText:
      "Discover student-friendly houses in the areas that matter to you.",
    findRoommateTitle: "Find a roommate",
    findRoommateText:
      "Connect with students looking for a compatible person to share a space.",
    chooseConfidence: "Choose with confidence",
    chooseConfidenceText:
      "Compare your options before deciding where your next chapter begins.",

    exploreEyebrow: "Explore",
    settleTitle: "Everything you need to",
    settleTitle2: "settle in.",
    settleText:
      "Whether you are moving closer to campus or looking for someone to share the journey with, Baraka Nest keeps the process simple.",

    homes: "HOMES",
    nextHome: "Find your next home.",
    nextHomeText:
      "Browse houses designed around student budgets, locations and everyday convenience.",

    roommateLabel: "ROOMMATES",
    yourPeople: "Find your people.",
    yourPeopleText:
      "Meet students looking for roommates and find a setup that actually works for you.",

    nextChapter: "Your next chapter",
    ready: "Ready to find where",
    belong: "you belong?",
    createAccount: "Create your account",

    copyright: "Baraka Nest",
  },

  Swahili: {
    built: "Imetengenezwa kwa wanafunzi kote Kenya",
    hero: "Pata sehemu",
    heroMuted: "inayokufaa.",
    heroText:
      "Baraka Nest inaunganisha nyumba za wanafunzi na roommates sehemu moja rahisi — ili kupata sehemu yako isiwe stress.",
    exploreHouses: "Tafuta nyumba",
    findRoommate: "Tafuta roommate",
    findPlace: "Pata makazi",
    designed: "Imeundwa kwa maisha ya wanafunzi",

    houses: "Nyumba",
    roommates: "Roommates",
    login: "Ingia",
    getStarted: "Anza sasa",

    yourNextHome: "Nyumba yako inayofuata",
    startsHere: "Inaanzia hapa.",
    explore: "Tafuta →",
    discover: "TAFUTA",
    idealRoommate:
      "Roommate anayekufaa anaweza kuwa karibu kuliko unavyofikiria.",

    findHome: "Pata nyumba",
    findHomeText:
      "Gundua nyumba zinazofaa wanafunzi katika maeneo muhimu kwako.",
    findRoommateTitle: "Pata roommate",
    findRoommateText:
      "Ungana na wanafunzi wanaotafuta mtu anayefaa kushiriki naye nyumba.",
    chooseConfidence: "Chagua ukiwa na uhakika",
    chooseConfidenceText:
      "Linganisha chaguo zako kabla ya kuamua mahali pa kuanzia sura yako inayofuata.",

    exploreEyebrow: "Gundua",
    settleTitle: "Kila kitu unachohitaji ili",
    settleTitle2: "uanze vizuri.",
    settleText:
      "Iwe unahamia karibu na campus au unatafuta mtu wa kushirikiana naye safari, Baraka Nest inafanya mchakato uwe rahisi.",

    homes: "NYUMBA",
    nextHome: "Pata nyumba yako inayofuata.",
    nextHomeText:
      "Browse nyumba kulingana na budget ya wanafunzi, location na convenience ya kila siku.",

    roommateLabel: "ROOMMATES",
    yourPeople: "Pata watu wako.",
    yourPeopleText:
      "Kutana na wanafunzi wanaotafuta roommates na upate setup inayokufaa.",

    nextChapter: "Sura yako inayofuata",
    ready: "Uko tayari kupata mahali",
    belong: "panapokufaa?",
    createAccount: "Tengeneza akaunti",

    copyright: "Baraka Nest",
  },

  Sheng: {
    built: "Imebuildiwa wasee wa campus Kenya mzima",
    hero: "Saka place",
    heroMuted: "inaku-fit.",
    heroText:
      "Baraka Nest imeweka student houses na roommates pamoja place moja — kusaka where unafit isiwe noma.",
    exploreHouses: "Saka nyumba",
    findRoommate: "Saka roommate",
    findPlace: "Nipatie place",
    designed: "Imebuildiwa around student life",

    houses: "Nyumba",
    roommates: "Roommates",
    login: "Log in",
    getStarted: "Anza sasa",

    yourNextHome: "Home yako ingine",
    startsHere: "Inaanzia hapa.",
    explore: "Saka →",
    discover: "DISCOVER",
    idealRoommate:
      "Roommate mwenye anakufit anaweza kuwa karibu kuliko unafikiria.",

    findHome: "Saka home",
    findHomeText:
      "Discover student-friendly houses kwa areas unadai.",
    findRoommateTitle: "Saka roommate",
    findRoommateText:
      "Connect na wasee wanadai roommate mwenye mnafit kushare space.",
    chooseConfidence: "Chagua ukiwa sure",
    chooseConfidenceText:
      "Compare options zako before udecide next chapter inaanzia wapi.",

    exploreEyebrow: "Explore",
    settleTitle: "Kila kitu unahitaji ili",
    settleTitle2: "uset in poa.",
    settleText:
      "Whether unahamia karibu na campus ama unadai mtu wa kushare naye journey, Baraka Nest inafanya process ikuwe simple.",

    homes: "HOMES",
    nextHome: "Saka home yako ingine.",
    nextHomeText:
      "Browse houses kulingana na student budget, location na convenience ya daily life.",

    roommateLabel: "ROOMMATES",
    yourPeople: "Pata wasee wako.",
    yourPeopleText:
      "Meet students wanadai roommates na upate setup yenye inawork for you.",

    nextChapter: "Chapter yako ingine",
    ready: "Uko ready kupata mahali",
    belong: "unakufit?",
    createAccount: "Create account",

    copyright: "Baraka Nest",
  },
};

export default function Home() {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const features = [
    {
      number: "01",
      title: t.findHome,
      description: t.findHomeText,
    },
    {
      number: "02",
      title: t.findRoommateTitle,
      description: t.findRoommateText,
    },
    {
      number: "03",
      title: t.chooseConfidence,
      description: t.chooseConfidenceText,
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#183b2c]">
      <Navbar />

      <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#dfe8dc]/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-32 lg:pt-32">
          <div className="flex flex-col justify-center">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/55 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              {t.built}
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[82px]">
              {t.hero}
              <br />
              <span className="text-[#e58b45]">{t.heroMuted}</span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-black/50 sm:text-lg">
              {t.heroText}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/houses"
                className="group flex items-center justify-center gap-3 rounded-full bg-[#183b2c] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#285640]"
              >
                {t.exploreHouses}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/roommates"
                className="flex items-center justify-center rounded-full border border-[#dce5db] bg-white px-7 py-4 text-sm font-bold transition hover:border-[#b8c8b8] hover:bg-[#f4f7f2]"
              >
                {t.findRoommate}
              </Link>
              <Link
                href="/find-my-place"
                className="flex items-center justify-center rounded-full border border-[#ecd8c4] bg-[#fff8f0] px-7 py-4 text-sm font-bold text-[#8a4e24] transition hover:bg-[#fdf0e2]"
              >
                {t.findPlace} <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-xs text-black/35">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fafafa] bg-black text-[10px] font-semibold text-white">
                  BN
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fafafa] bg-black/15 text-[10px] font-semibold">
                  +
                </div>
              </div>

              <span>{t.designed}</span>
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute right-0 top-8 h-[470px] w-[390px] overflow-hidden rounded-[36px] bg-[#111111] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black" />

              <div className="relative flex h-full flex-col justify-between p-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/45">
                    BARAKA NEST
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/45">
                    01
                  </span>
                </div>

                <div>
                  <p className="text-sm text-white/40">
                    {t.yourNextHome}
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                    {t.startsHere}
                  </h2>

                  <div className="mt-8 h-px w-full bg-white/10" />

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-white/35">
                      {t.houses}
                    </span>

                    <span className="text-xs text-white/70">
                      {t.explore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-0 w-64 rounded-3xl border border-black/10 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/40">
                  {t.discover}
                </span>

                <span className="text-xs text-black/30">→</span>
              </div>

              <p className="mt-5 text-lg font-semibold tracking-tight">
                {t.idealRoommate}
              </p>

              <div className="mt-5 h-1 w-16 rounded-full bg-black" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/[0.07] bg-white">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`px-6 py-10 sm:px-8 lg:px-10 ${
                index !== 0
                  ? "border-t border-black/[0.07] md:border-l md:border-t-0"
                  : ""
              }`}
            >
              <span className="text-xs font-semibold text-black/25">
                {feature.number}
              </span>

              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-black/45">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
            {t.exploreEyebrow}
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            {t.settleTitle}
            <br />
            {t.settleTitle2}
          </h2>

          <p className="mt-6 text-base leading-7 text-black/45">
            {t.settleText}
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Link
            href="/houses"
            className="group relative min-h-[360px] overflow-hidden rounded-[32px] bg-[#111111] p-8 text-white transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/40">
                  {t.homes}
                </span>

                <span className="text-xl text-white/40 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  {t.nextHome}
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
                  {t.nextHomeText}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/roommates"
            className="group relative min-h-[360px] overflow-hidden rounded-[32px] border border-black/10 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-black/[0.035] blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/35">
                  {t.roommateLabel}
                </span>

                <span className="text-xl text-black/30 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  {t.yourPeople}
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-black/45">
                  {t.yourPeopleText}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#111111] px-7 py-16 text-white sm:px-12 lg:px-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
              {t.nextChapter}
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              {t.ready}
              <br />
              {t.belong}
            </h2>

            <div className="mt-9">
              <Link
                href="/register"
                className="inline-flex rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                {t.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <span className="font-semibold text-black">
          {t.copyright.split(" ")[0]}
          <span className="text-black/30">Nest</span>
        </span>

        <div className="flex gap-6">
          <Link
            href="/houses"
            className="transition hover:text-black"
          >
            {t.houses}
          </Link>

          <Link
            href="/roommates"
            className="transition hover:text-black"
          >
            {t.roommates}
          </Link>

          <Link
            href="/login"
            className="transition hover:text-black"
          >
            {t.login}
          </Link>

          <Link href="/contact" className="transition hover:text-black">
            Contact
          </Link>
        </div>

        <span>
          © {new Date().getFullYear()} Baraka Nest
        </span>
      </footer>
    </main>
  );
}
