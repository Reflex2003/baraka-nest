import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Find a home",
    description:
      "Discover student-friendly houses in the areas that matter to you.",
  },
  {
    number: "02",
    title: "Find a roommate",
    description:
      "Connect with students looking for a compatible person to share a space.",
  },
  {
    number: "03",
    title: "Choose with confidence",
    description:
      "Compare your options before deciding where your next chapter begins.",
  },
];

export default function Home() {
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
              className="text-sm font-medium text-black/55 transition hover:text-black"
            >
              Houses
            </Link>

            <Link
              href="/roommates"
              className="text-sm font-medium text-black/55 transition hover:text-black"
            >
              Roommates
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-black/55 transition hover:text-black"
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

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-black/[0.025] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pb-32 lg:pt-32">
          <div className="flex flex-col justify-center">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/55 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Built for students across Kenya
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[82px]">
              Find a place
              <br />
              <span className="text-black/35">that feels right.</span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-black/50 sm:text-lg">
              Baraka Nest brings student houses and roommates together in one
              simple place — so finding where you belong does not have to be
              stressful.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/houses"
                className="group flex items-center justify-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Explore houses
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/roommates"
                className="flex items-center justify-center rounded-full border border-black/10 bg-white px-7 py-4 text-sm font-semibold transition hover:border-black/20 hover:bg-black/[0.02]"
              >
                Find a roommate
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

              <span>Designed around student life</span>
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
                  <p className="text-sm text-white/40">Your next home</p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                    Starts here.
                  </h2>

                  <div className="mt-8 h-px w-full bg-white/10" />

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-white/35">Houses</span>

                    <span className="text-xs text-white/70">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 left-0 w-64 rounded-3xl border border-black/10 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black/40">
                  DISCOVER
                </span>

                <span className="text-xs text-black/30">→</span>
              </div>

              <p className="mt-5 text-lg font-semibold tracking-tight">
                Your ideal roommate might be closer than you think.
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
            Explore
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Everything you need to
            <br />
            settle in.
          </h2>

          <p className="mt-6 text-base leading-7 text-black/45">
            Whether you are moving closer to campus or looking for someone to
            share the journey with, Baraka Nest keeps the process simple.
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
                  HOMES
                </span>

                <span className="text-xl text-white/40 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  Find your next home.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
                  Browse houses designed around student budgets, locations and
                  everyday convenience.
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
                  ROOMMATES
                </span>

                <span className="text-xl text-black/30 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  Find your people.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-black/45">
                  Meet students looking for roommates and find a setup that
                  actually works for you.
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
              Your next chapter
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
              Ready to find where
              <br />
              you belong?
            </h2>

            <div className="mt-9">
              <Link
                href="/register"
                className="inline-flex rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-black/35 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <span className="font-semibold text-black">
          Baraka<span className="text-black/30">Nest</span>
        </span>

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