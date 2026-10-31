import Link from "next/link";
import Navbar from "../navbar";

export default function DashboardPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f8f4] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-medium text-[#e58b45]">Baraka Nest</p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#183b2c]">
              Welcome back 👋
            </h1>

            <p className="mt-2 text-[#647067]">
              Everything you need to find your space and your people.
            </p>
          </div>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/houses"
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-3xl">🏠</p>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Find a house
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                Explore student-friendly homes.
              </p>
            </Link>

            <Link
              href="/roommates"
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-3xl">🤝</p>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Find roommates
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                Meet students who match your vibe.
              </p>
            </Link>

            <Link
              href="/roommates/requests"
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-3xl">📩</p>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Requests
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                Check your roommate requests.
              </p>
            </Link>

            <Link
              href="/roommates/connections"
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-3xl">🔗</p>

              <h2 className="mt-5 text-lg font-bold text-[#183b2c]">
                Connections
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                See people you connected with.
              </p>
            </Link>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-[#183b2c] p-7 text-white lg:col-span-2">
              <p className="text-sm font-medium text-[#f2b27b]">
                Your Baraka Nest
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Find your space. Find your people.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Start exploring houses or create your roommate profile to get
                matched with students around you.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/houses"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#183b2c] transition hover:bg-[#f2f4ef]"
                >
                  Explore houses
                </Link>

                <Link
                  href="/roommates/create"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create roommate profile
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <p className="text-sm font-medium text-[#718078]">
                Profile
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#183b2c]">
                Complete your profile
              </h2>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf0eb]">
                <div className="h-full w-[40%] rounded-full bg-[#e58b45]" />
              </div>

              <p className="mt-3 text-sm text-[#718078]">
                Your profile is 40% complete.
              </p>

              <Link
                href="/roommates/create"
                className="mt-5 inline-block text-sm font-semibold text-[#183b2c] hover:text-[#e58b45]"
              >
                Complete profile →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}