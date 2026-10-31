"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "../navbar";

const houses = [
  {
    id: "kilimani-modern-studios",
    name: "Kilimani Modern Studios",
    location: "Kilimani, Nairobi",
    distance: "1.2 km from campus",
    price: 12500,
    type: "Studio",
    rooms: "1 bedroom",
    available: 4,
    rating: "4.8",
    featured: true,
    accent: "dark",
  },
  {
    id: "juja-student-hub",
    name: "Juja Student Hub",
    location: "Juja, Kiambu",
    distance: "0.8 km from campus",
    price: 7500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 8,
    rating: "4.6",
    featured: true,
    accent: "light",
  },
  {
    id: "kasarani-green-court",
    name: "Green Court Residences",
    location: "Kasarani, Nairobi",
    distance: "1.5 km from campus",
    price: 9000,
    type: "Bedsitter",
    rooms: "1 room",
    available: 3,
    rating: "4.7",
    featured: false,
    accent: "soft",
  },
  {
    id: "rongai-student-living",
    name: "Rongai Student Living",
    location: "Rongai, Kajiado",
    distance: "2.1 km from campus",
    price: 6500,
    type: "Single Room",
    rooms: "1 room",
    available: 11,
    rating: "4.5",
    featured: false,
    accent: "light",
  },
  {
    id: "eldoret-campus-view",
    name: "Campus View Apartments",
    location: "Eldoret, Uasin Gishu",
    distance: "0.6 km from campus",
    price: 8500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 5,
    rating: "4.9",
    featured: true,
    accent: "dark",
  },
  {
    id: "mombasa-student-haven",
    name: "Student Haven",
    location: "Mombasa",
    distance: "1.8 km from campus",
    price: 8000,
    type: "Single Room",
    rooms: "1 room",
    available: 6,
    rating: "4.6",
    featured: false,
    accent: "soft",
  },
];

const locations = [
  "All locations",
  "Nairobi",
  "Kiambu",
  "Kajiado",
  "Uasin Gishu",
  "Mombasa",
];

const types = ["All types", "Single Room", "Bedsitter", "Studio"];

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString()}`;
}

export default function HousesPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [type, setType] = useState("All types");
  const [maxPrice, setMaxPrice] = useState("Any price");

  const filteredHouses = useMemo(() => {
    return houses.filter((house) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        house.name.toLowerCase().includes(searchValue) ||
        house.location.toLowerCase().includes(searchValue) ||
        house.type.toLowerCase().includes(searchValue);

      const matchesLocation =
        location === "All locations" ||
        house.location.toLowerCase().includes(location.toLowerCase());

      const matchesType = type === "All types" || house.type === type;

      const matchesPrice =
        maxPrice === "Any price" ||
        (maxPrice === "Under KSh 7,500" && house.price < 7500) ||
        (maxPrice === "Under KSh 10,000" && house.price < 10000) ||
        (maxPrice === "Under KSh 15,000" && house.price < 15000);

      return matchesSearch && matchesLocation && matchesType && matchesPrice;
    });
  }, [search, location, type, maxPrice]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <Navbar />

      <section className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 sm:px-8 lg:px-10 lg:pb-20 lg:pt-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              Student housing
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Find somewhere
              <br />
              <span className="text-black/30">worth calling home.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/50 sm:text-lg">
              Explore student-friendly houses across Kenya and find a place
              that fits your budget, location and lifestyle.
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
                  placeholder="Search houses, areas..."
                  className="h-14 w-full rounded-2xl border border-black/[0.07] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/20 focus:ring-4 focus:ring-black/[0.03]"
                />
              </div>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                {locations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                {types.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-14 rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-black/65 outline-none focus:border-black/20"
              >
                <option>Any price</option>
                <option>Under KSh 7,500</option>
                <option>Under KSh 10,000</option>
                <option>Under KSh 15,000</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
              Explore homes
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              {filteredHouses.length} places to explore
            </h2>
          </div>

          <div className="text-sm text-black/40">
            Updated for student living
          </div>
        </div>

        {filteredHouses.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHouses.map((house) => (
              <Link
                key={house.id}
                href={`/houses/${house.id}`}
                className="group overflow-hidden rounded-[28px] border border-black/[0.08] bg-white transition duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-xl"
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
                    {house.featured && (
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                        Featured
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

                      <p className="mt-1 text-xs text-black/35">per month</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">{house.rooms}</p>

                      <p className="mt-1 text-xs text-black/35">
                        {house.available} available
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-black/[0.07] pt-4">
                    <span className="text-xs text-black/40">
                      {house.distance}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.04] text-xl">
              ⌕
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight">
              No houses found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
              Try changing your search or filters. More student homes will be
              added as Baraka Nest grows.
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
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="px-6 pb-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#111111] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                Cannot find what you need?
              </p>

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Your ideal place might be
                <br />
                one search away.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/40">
                Baraka Nest is being built to make student housing easier to
                discover, compare and choose.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex w-fit rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Join Baraka Nest
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link href="/" className="font-semibold text-black">
          Baraka<span className="text-black/30">Nest</span>
        </Link>

        <div className="flex gap-6">
          <Link href="/houses" className="transition hover:text-black">
            Houses
          </Link>

          <Link href="/roommates" className="transition hover:text-black">
            Roommates
          </Link>

          <Link href="/login" className="transition hover:text-black">
            Log in
          </Link>
        </div>

        <span>© {new Date().getFullYear()} Baraka Nest</span>
      </footer>
    </main>
  );
}