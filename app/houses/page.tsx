"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar";
import { useLanguage, type Language } from "../language-context";
import { getMapEmbedUrl, houses as mapListings } from "@/lib/houses";

const translations = {
  English: {
    eyebrow: "Student housing",
    title: "Find somewhere",
    titleMuted: "worth calling home.",
    description:
      "Explore student-friendly houses across Kenya and find a place that fits your budget, location and lifestyle.",
    searchPlaceholder: "Search houses, areas...",
    allLocations: "All locations",
    allTypes: "All types",
    anyPrice: "Any price",
    under7500: "Under KSh 7,500",
    under10000: "Under KSh 10,000",
    under15000: "Under KSh 15,000",
    exploreHomes: "Explore homes",
    placesToExplore: "places to explore",
    updated: "Updated for student living",
    map: "Map",
    list: "List",
    mapTitle: "Explore homes on the map",
    mapNote: "Map pins are approximate neighbourhood locations.",
    viewHouse: "View listing",
    save: "Save home",
    saved: "Saved",
    savedOnly: "Saved homes",
    allHomes: "All homes",
    signInToSave: "Sign in to save homes to your list.",
    featured: "Featured",
    perMonth: "per month",
    available: "available",
    noHouses: "No houses found",
    noHousesText:
      "Try changing your search or filters. More student homes will be added as Baraka Nest grows.",
    clearFilters: "Clear filters",
    cannotFind: "Cannot find what you need?",
    idealPlace: "Your ideal place might be",
    oneSearch: "one search away.",
    ctaText:
      "Baraka Nest is being built to make student housing easier to discover, compare and choose.",
    join: "Join Baraka Nest",
    houses: "Houses",
    roommates: "Roommates",
    login: "Log in",
    listingLoadError: "Live listings could not be refreshed. Showing the latest cached sample while we reconnect.",
  },

  Swahili: {
    eyebrow: "Makazi ya wanafunzi",
    title: "Tafuta mahali",
    titleMuted: "pa kuita nyumbani.",
    description:
      "Gundua nyumba zinazofaa wanafunzi kote Kenya na upate mahali panapoendana na budget, eneo na lifestyle yako.",
    searchPlaceholder: "Tafuta nyumba, maeneo...",
    allLocations: "Maeneo yote",
    allTypes: "Aina zote",
    anyPrice: "Bei yoyote",
    under7500: "Chini ya KSh 7,500",
    under10000: "Chini ya KSh 10,000",
    under15000: "Chini ya KSh 15,000",
    exploreHomes: "Gundua nyumba",
    placesToExplore: "maeneo ya kuchunguza",
    updated: "Imeandaliwa kwa maisha ya wanafunzi",
    map: "Ramani",
    list: "Orodha",
    mapTitle: "Gundua nyumba kwenye ramani",
    mapNote: "Alama za ramani zinaonyesha takriban eneo la mtaa.",
    viewHouse: "Angalia tangazo",
    save: "Hifadhi nyumba",
    saved: "Imehifadhiwa",
    savedOnly: "Nyumba zilizohifadhiwa",
    allHomes: "Nyumba zote",
    signInToSave: "Ingia ili kuhifadhi nyumba.",
    featured: "Imeangaziwa",
    perMonth: "kwa mwezi",
    available: "zinapatikana",
    noHouses: "Hakuna nyumba zilizopatikana",
    noHousesText:
      "Jaribu kubadilisha search au filters. Nyumba zaidi zitaongezwa kadri Baraka Nest inavyokua.",
    clearFilters: "Ondoa filters",
    cannotFind: "Hupati unachohitaji?",
    idealPlace: "Mahali unapotafuta huenda",
    oneSearch: "papo kwa search moja.",
    ctaText:
      "Baraka Nest inajengwa ili kufanya kutafuta, kulinganisha na kuchagua makazi ya wanafunzi kuwa rahisi.",
    join: "Jiunge na Baraka Nest",
    houses: "Nyumba",
    roommates: "Roommates",
    login: "Ingia",
    listingLoadError: "Hatukuweza kusasisha matangazo. Tunaonyesha yaliyohifadhiwa kwa muda tunapounganisha tena.",
  },

  Sheng: {
    eyebrow: "Student housing",
    title: "Tafuta place",
    titleMuted: "ya kuita home.",
    description:
      "Saka nyumba za student across Kenya upate place ina-fit budget, area na lifestyle yako.",
    searchPlaceholder: "Saka nyumba, areas...",
    allLocations: "Areas zote",
    allTypes: "Aina zote",
    anyPrice: "Bei yoyote",
    under7500: "Chini ya KSh 7,500",
    under10000: "Chini ya KSh 10,000",
    under15000: "Chini ya KSh 15,000",
    exploreHomes: "Saka nyumba",
    placesToExplore: "places za kusaka",
    updated: "Updated for student life",
    map: "Map",
    list: "List",
    mapTitle: "Check homes on the map",
    mapNote: "Map pins ni approximate area tu.",
    viewHouse: "Check listing",
    save: "Save keja",
    saved: "Ime-save",
    savedOnly: "Nyumba ume-save",
    allHomes: "Nyumba zote",
    signInToSave: "Log in u-save nyumba.",
    featured: "Featured",
    perMonth: "per month",
    available: "ziko available",
    noHouses: "Hakuna nyumba imepatikana",
    noHousesText:
      "Cheza na search ama filters. Nyumba mob zitaongezwa vile Baraka Nest inagrow.",
    clearFilters: "Clear filters",
    cannotFind: "Hupati unadai?",
    idealPlace: "Place yako ideal inaweza kuwa",
    oneSearch: "search moja tu away.",
    ctaText:
      "Baraka Nest inajengwa kufanya kusaka, compare na kuchagua student housing ikuwe easier.",
    join: "Join Baraka Nest",
    houses: "Nyumba",
    roommates: "Roommates",
    login: "Log in",
    listingLoadError: "Live listings hazikuload. Tunaonyesha sample ya karibuni tukiconnect tena.",
  },
};

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString()}`;
}

export default function HousesPage() {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [type, setType] = useState("All types");
  const [maxPrice, setMaxPrice] = useState("Any price");
  const [view, setView] = useState<"list" | "map">("list");
  const [listings, setListings] = useState(mapListings);
  const [listingError, setListingError] = useState(false);
  const [selectedMapHouseId, setSelectedMapHouseId] = useState(mapListings[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [savingFavorite, setSavingFavorite] = useState("");
  const [houseControls, setHouseControls] = useState<Record<string, { hidden: boolean; featured: boolean }>>({});

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/houses/favorites", { credentials: "include" }).then(async (response) => response.ok ? response.json() : null),
      fetch("/api/houses/controls", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
      fetch("/api/houses", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
    ]).then(([saved, controls, listingResult]) => {
      if (!active) return;
      if (Array.isArray(saved?.favorites)) setFavorites(saved.favorites);
      if (controls?.controls && typeof controls.controls === "object") setHouseControls(controls.controls);
      if (Array.isArray(listingResult?.houses)) {
        setListings(listingResult.houses);
        setListingError(false);
      } else setListingError(true);
    }).catch(() => { if (active) setListingError(true); });
    return () => { active = false; };
  }, []);

  async function toggleFavorite(houseId: string) {
    const save = !favorites.includes(houseId);
    setFavoriteError("");
    setSavingFavorite(houseId);
    try {
      const response = await fetch("/api/houses/favorites", {
        method: save ? "POST" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId }),
      });
      const data = await response.json();
      if (response.status === 401) throw new Error("sign-in");
      if (!response.ok) throw new Error(data.error || "failed");
      setFavorites((current) => save ? [...current, houseId] : current.filter((id) => id !== houseId));
    } catch (error) {
      setFavoriteError(error instanceof Error && error.message === "sign-in" ? t.signInToSave : t.signInToSave);
    } finally {
      setSavingFavorite("");
    }
  }

  const translatedLocations = [
    t.allLocations,
    ...Array.from(new Set(listings.map((house) => house.county))).sort(),
  ];

  const translatedTypes = [
    t.allTypes,
    ...Array.from(new Set(listings.map((house) => house.type))).sort(),
  ];

  const priceOptions = [
    t.anyPrice,
    t.under7500,
    t.under10000,
    t.under15000,
  ];

  const filteredHouses = useMemo(() => {
    return listings.filter((house) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        house.name.toLowerCase().includes(searchValue) ||
        house.location.toLowerCase().includes(searchValue) ||
        house.type.toLowerCase().includes(searchValue);

      const matchesLocation =
        location === "All locations" ||
        house.county
          .toLowerCase()
          .includes(location.toLowerCase());

      const matchesType =
        type === "All types" || house.type === type;

      const matchesPrice =
        maxPrice === "Any price" ||
        (maxPrice === "Under KSh 7,500" && house.price < 7500) ||
        (maxPrice === "Under KSh 10,000" && house.price < 10000) ||
        (maxPrice === "Under KSh 15,000" && house.price < 15000);
      const notHidden = !houseControls[house.id]?.hidden;

      return (
        notHidden &&
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesPrice &&
        (!savedOnly || favorites.includes(house.id))
      );
    });
  }, [search, location, type, maxPrice, savedOnly, favorites, houseControls, listings]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <Navbar />

      <section className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              {t.eyebrow}
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {t.title}
              <br />
              <span className="text-black/30">
                {t.titleMuted}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/50 sm:text-lg">
              {t.description}
            </p>
          </div>

          <div className="mt-12 rounded-[28px] border border-black/10 bg-[#fafafa] p-3 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/30">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="h-14 w-full rounded-2xl border border-black/[0.07] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/20 focus:ring-4 focus:ring-black/[0.03]"
                />
              </div>

              <select
                value={
                  location === "All locations"
                    ? t.allLocations
                    : location
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setLocation(
                    value === t.allLocations
                      ? "All locations"
                      : value,
                  );
                }}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                {translatedLocations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={
                  type === "All types"
                    ? t.allTypes
                    : type
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setType(
                    value === t.allTypes
                      ? "All types"
                      : value,
                  );
                }}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                {translatedTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={
                  maxPrice === "Any price"
                    ? t.anyPrice
                    : maxPrice === "Under KSh 7,500"
                      ? t.under7500
                      : maxPrice === "Under KSh 10,000"
                        ? t.under10000
                        : t.under15000
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === t.anyPrice) {
                    setMaxPrice("Any price");
                  } else if (value === t.under7500) {
                    setMaxPrice("Under KSh 7,500");
                  } else if (value === t.under10000) {
                    setMaxPrice("Under KSh 10,000");
                  } else {
                    setMaxPrice("Under KSh 15,000");
                  }
                }}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                {priceOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
        {listingError && <p role="status" className="mb-5 rounded-2xl border border-[#ead9c7] bg-[#fff8f0] px-4 py-3 text-sm leading-6 text-[#82532f]">{t.listingLoadError}</p>}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
              {t.exploreHomes}
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              {filteredHouses.length} {t.placesToExplore}
            </h2>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-sm text-black/40">{t.updated}</div>
              <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((value) => !value)}
                className={`min-h-10 rounded-full border px-3 text-xs font-bold transition ${savedOnly ? "border-[#183b2c] bg-[#edf3ed] text-[#183b2c]" : "border-[#e1e8df] bg-white text-[#69766d] hover:bg-[#f3f6f1]"}`}>
                {savedOnly ? t.allHomes : `♡ ${t.savedOnly}`}
              </button>
            <div role="group" aria-label="Housing view" className="flex rounded-full border border-[#e1e8df] bg-white p-1">
              {(["list", "map"] as const).map((mode) => (
                <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)}
                  className={`min-h-9 rounded-full px-3 text-xs font-bold transition ${view === mode ? "bg-[#183b2c] text-white" : "text-[#69766d] hover:bg-[#f3f6f1]"}`}>
                  {mode === "list" ? t.list : t.map}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "map" && filteredHouses.length > 0 && (() => {
          const selected = filteredHouses.find((house) => house.id === selectedMapHouseId) ?? filteredHouses[0];
          const mapListing = selected;
          return (
            <div className="mt-7 grid overflow-hidden rounded-[26px] border border-[#e3e9e1] bg-white shadow-sm lg:grid-cols-[1.25fr_.75fr]">
              <iframe title={`${selected.name} map`} src={getMapEmbedUrl(mapListing)} loading="lazy" referrerPolicy="no-referrer"
                className="h-[300px] w-full border-0 sm:h-[380px]" />
              <div className="flex flex-col p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#87938a]">{t.mapTitle}</p>
                <h3 className="mt-2 text-lg font-extrabold text-[#183b2c]">{selected.name}</h3>
                <p className="mt-1 text-sm text-[#748078]">{selected.location}</p>
                <p className="mt-4 text-xl font-extrabold text-[#26352b]">{formatPrice(selected.price)} <span className="text-xs font-medium text-[#849087]">{t.perMonth}</span></p>
                <p className="mt-auto pt-4 text-xs leading-5 text-[#8a958e]">{t.mapNote}</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {filteredHouses.map((house) => (
                    <button key={house.id} type="button" aria-pressed={selected.id === house.id} onClick={() => setSelectedMapHouseId(house.id)}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${selected.id === house.id ? "bg-[#edf3ed] text-[#183b2c]" : "bg-[#f5f7f3] text-[#69766d]"}`}>
                      {house.location}
                    </button>
                  ))}
                </div>
                <Link href={`/houses/${selected.id}`} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white hover:bg-[#285640]">{t.viewHouse}</Link>
              </div>
            </div>
          );
        })()}

        {favoriteError && <p role="status" className="mt-4 rounded-xl bg-[#fff7ed] px-4 py-3 text-sm font-medium text-[#8f5421]">{favoriteError} <Link href="/login" className="font-bold underline">{t.login}</Link></p>}

        {filteredHouses.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHouses.map((house) => {
              const details = house;
              const isSaved = favorites.includes(house.id);
              const isFeatured = houseControls[house.id]?.featured ?? house.featured;
              return (
              <article
                key={house.id}
                className="group relative overflow-hidden rounded-[28px] border border-[#e3e9e1] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#cdd9ca] hover:shadow-xl"
              >
              <Link
                href={`/houses/${house.id}`}
                className="block"
              >
                <div
                  className={`relative h-60 overflow-hidden ${
                    house.accent === "dark"
                      ? "bg-[#111111]"
                      : house.accent === "soft"
                        ? "bg-[#e9e9e6]"
                        : "bg-[#deded9]"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/[0.12]" />

                  <div className="absolute left-5 top-5 flex gap-2">
                    {isFeatured && (
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                        {t.featured}
                      </span>
                    )}

                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-medium ${
                        house.accent === "dark"
                          ? "border-white/15 bg-white/10 text-white/65"
                          : "border-black/10 bg-white/70 text-black/50"
                      }`}
                    >
                      {house.type}
                    </span>
                  </div>

                  <div
                    className={`absolute bottom-5 left-5 text-xs ${
                      house.accent === "dark"
                        ? "text-white/40"
                        : "text-black/35"
                    }`}
                  >
                    BARAKA NEST
                  </div>

                  <div
                    className={`absolute bottom-5 right-5 text-2xl transition-transform duration-300 group-hover:translate-x-1 ${
                      house.accent === "dark"
                        ? "text-white/50"
                        : "text-black/30"
                    }`}
                  >
                    →
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.025em]">
                        {house.name}
                      </h3>

                      <p className="mt-1.5 text-sm text-black/45">
                        {house.location}
                      </p>
                    </div>

                    <div className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-medium">
                      ★ {house.rating}
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-semibold tracking-tight">
                        {formatPrice(house.price)}
                      </p>

                      <p className="mt-1 text-xs text-black/35">
                        {t.perMonth}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {house.rooms}
                      </p>

                      <p className="mt-1 text-xs text-black/35">
                        {house.available} {t.available}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-black/[0.07] pt-4">
                    <span className="text-xs text-black/40">
                      {house.distance}
                    </span>
                  </div>
                  {details && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {details.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="rounded-full bg-[#f3f6f1] px-2.5 py-1 text-[10px] font-semibold text-[#65746a]">{amenity}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
              <button type="button" disabled={savingFavorite === house.id}
                aria-label={isSaved ? t.saved : t.save} aria-pressed={isSaved}
                onClick={() => void toggleFavorite(house.id)}
                className="absolute right-4 top-4 z-10 flex h-11 min-w-11 items-center justify-center rounded-full border border-white/70 bg-white/95 px-3 text-lg text-[#183b2c] shadow-sm transition hover:scale-105 disabled:opacity-60">
                {savingFavorite === house.id ? "…" : isSaved ? "♥" : "♡"}
              </button>
              </article>
            );})}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.04] text-xl">
              ⌕
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight">
              {t.noHouses}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
              {t.noHousesText}
            </p>

            <button
              onClick={() => {
                setSearch("");
                setLocation("All locations");
                setType("All types");
                setMaxPrice("Any price");
              }}
              className="mt-6 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              {t.clearFilters}
            </button>
          </div>
        )}
      </section>

      <section className="px-6 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#111111] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                {t.cannotFind}
              </p>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                {t.idealPlace}
                <br />
                {t.oneSearch}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/40">
                {t.ctaText}
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex w-fit rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              {t.join}
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link href="/" className="font-semibold text-black">
          Baraka<span className="text-black/30">Nest</span>
        </Link>

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
        </div>

        <span>© {new Date().getFullYear()} Baraka Nest</span>
      </footer>
    </main>
  );
}
