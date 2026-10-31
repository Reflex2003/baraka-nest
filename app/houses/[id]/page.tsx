import Link from "next/link";
import { notFound } from "next/navigation";

const houses = {
  "kilimani-modern-studios": {
    name: "Kilimani Modern Studios",
    location: "Kilimani, Nairobi",
    distance: "1.2 km from campus",
    price: 12500,
    type: "Studio",
    rooms: "1 bedroom",
    available: 4,
    rating: "4.8",
    description:
      "Modern student-friendly studios in a convenient Kilimani location, designed for students who want privacy, comfort and easy access to everyday essentials.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "juja-student-hub": {
    name: "Juja Student Hub",
    location: "Juja, Kiambu",
    distance: "0.8 km from campus",
    price: 7500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 8,
    rating: "4.6",
    description:
      "A student-focused residence close to campus, offering practical spaces, convenient transport access and the essentials needed for everyday student life.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Common area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "kasarani-green-court": {
    name: "Green Court Residences",
    location: "Kasarani, Nairobi",
    distance: "1.5 km from campus",
    price: 9000,
    type: "Bedsitter",
    rooms: "1 room",
    available: 3,
    rating: "4.7",
    description:
      "Comfortable student accommodation in a well-connected part of Kasarani, with easy access to transport, shopping and nearby campuses.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
    ],
  },

  "rongai-student-living": {
    name: "Rongai Student Living",
    location: "Rongai, Kajiado",
    distance: "2.1 km from campus",
    price: 6500,
    type: "Single Room",
    rooms: "1 room",
    available: 11,
    rating: "4.5",
    description:
      "Affordable student accommodation for students looking for a practical place to live without stretching the budget.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
      "CCTV",
    ],
  },

  "eldoret-campus-view": {
    name: "Campus View Apartments",
    location: "Eldoret, Uasin Gishu",
    distance: "0.6 km from campus",
    price: 8500,
    type: "Bedsitter",
    rooms: "1 room",
    available: 5,
    rating: "4.9",
    description:
      "A highly convenient student residence located close to campus, giving you more time for school and less time worrying about transport.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Wi-Fi available",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
    ],
  },

  "mombasa-student-haven": {
    name: "Student Haven",
    location: "Mombasa",
    distance: "1.8 km from campus",
    price: 8000,
    type: "Single Room",
    rooms: "1 room",
    available: 6,
    rating: "4.6",
    description:
      "A practical student residence with convenient access to campus, shopping areas and public transport.",
    amenities: [
      "24/7 security",
      "Reliable water",
      "Secure parking",
      "CCTV",
      "Laundry area",
      "Prepaid electricity",
      "Nearby shops",
      "Public transport nearby",
    ],
  },
};

type HouseId = keyof typeof houses;

function formatPrice(price: number) {
  return `KSh ${price.toLocaleString()}`;
}

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!(id in houses)) {
    notFound();
  }

  const house = houses[id as HouseId];

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fafafa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-[-0.04em]"
          >
            Baraka<span className="text-black/35">Nest</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/houses"
              className="text-sm font-semibold text-black"
            >
              Houses
            </Link>

            <Link
              href="/roommates"
              className="text-sm font-medium text-black/50 transition hover:text-black"
            >
              Roommates
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-black/50 transition hover:text-black"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Get started
            </Link>
          </nav>

          <Link
            href="/register"
            className="rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white md:hidden"
          >
            Get started
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/houses"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
        >
          <span className="text-lg">←</span>
          Back to houses
        </Link>

        <section className="mt-8 overflow-hidden rounded-[36px] bg-[#111111] text-white shadow-2xl">
          <div className="relative min-h-[440px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] via-transparent to-black" />

            <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-3xl" />

            <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-white/[0.03] blur-3xl" />

            <div className="relative flex min-h-[440px] flex-col justify-between p-7 sm:p-10 lg:p-14">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                    {house.type}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs text-white/60">
                    {house.available} available
                  </span>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/50">
                  ★ {house.rating}
                </div>
              </div>

              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                  Student residence
                </p>

                <h1 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  {house.name}
                </h1>

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
                  <span>⌖ {house.location}</span>
                  <span>•</span>
                  <span>{house.distance}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                About this place
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                A place built around student life.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/50">
                {house.description}
              </p>
            </section>

            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                Amenities
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {house.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl bg-[#fafafa] px-4 py-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                      ✓
                    </span>

                    <span className="text-sm font-medium text-black/70">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                Location
              </p>

              <div className="mt-6 flex min-h-[220px] items-center justify-center overflow-hidden rounded-3xl bg-[#111111]">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xl text-white">
                    ⌖
                  </div>

                  <p className="mt-5 text-sm font-medium text-white">
                    {house.location}
                  </p>

                  <p className="mt-2 text-xs text-white/35">
                    {house.distance}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-black/35">
                Exact location details can be shared after an inquiry.
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-[28px] border border-black/[0.08] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/30">
                Monthly rent
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.04em]">
                    {formatPrice(house.price)}
                  </p>

                  <p className="mt-1 text-xs text-black/35">
                    per month
                  </p>
                </div>

                <div className="rounded-full bg-black/[0.04] px-3 py-2 text-xs font-medium">
                  {house.rooms}
                </div>
              </div>

              <div className="my-7 h-px bg-black/[0.07]" />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    Availability
                  </span>

                  <span className="text-sm font-semibold">
                    {house.available} spaces
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    Location
                  </span>

                  <span className="max-w-[180px] text-right text-sm font-semibold">
                    {house.location}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    Distance
                  </span>

                  <span className="text-sm font-semibold">
                    {house.distance.replace(" from campus", "")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/40">
                    Rating
                  </span>

                  <span className="text-sm font-semibold">
                    ★ {house.rating}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-8 h-14 w-full rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-black/80"
              >
                I am interested
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-black/30">
                Sign in to send an inquiry about this house.
              </p>
            </div>

            <div className="mt-4 rounded-[28px] border border-black/[0.08] bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  BN
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Baraka Nest
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Student housing made simpler.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <Link
          href="/"
          className="font-semibold text-black"
        >
          Baraka<span className="text-black/30">Nest</span>
        </Link>

        <div className="flex gap-6">
          <Link
            href="/houses"
            className="transition hover:text-black"
          >
            Houses
          </Link>

          <Link
            href="/roommates"
            className="transition hover:text-black"
          >
            Roommates
          </Link>

          <Link
            href="/login"
            className="transition hover:text-black"
          >
            Log in
          </Link>
        </div>

        <span>© {new Date().getFullYear()} Baraka Nest</span>
      </footer>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(houses).map((id) => ({
    id,
  }));
}