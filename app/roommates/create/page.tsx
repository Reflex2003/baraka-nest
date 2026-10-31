"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const interestOptions = [
  "Football",
  "Gaming",
  "Music",
  "Movies",
  "Gym",
  "Reading",
  "Travel",
  "Cooking",
  "Tech",
  "Photography",
];

const lifestyleOptions = [
  "Clean & organized",
  "Quiet home",
  "Social",
  "Early sleeper",
  "Night owl",
  "Study focused",
  "Occasional hangouts",
  "Respectful of privacy",
];

const locationOptions = [
  "Kilimani",
  "Juja",
  "Kasarani",
  "Rongai",
  "Kahawa",
  "Ruiru",
  "Eldoret",
  "Nakuru",
  "Mombasa",
];

export default function CreateRoommatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [preference, setPreference] = useState("");
  const [about, setAbout] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleOption(
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !age ||
      !school.trim() ||
      !location ||
      !budget ||
      !moveIn ||
      !preference ||
      !about.trim()
    ) {
      setError("Please complete all required profile details.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/roommates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          school: school.trim(),
          location,
          budget: Number(budget),
          moveIn,
          preference,
          about: about.trim(),
          interests,
          lifestyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create your profile.");
      }

      if (!data.id) {
        throw new Error("Profile was created but no profile ID was returned.");
      }

      router.push(`/roommates/${data.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while creating your profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-xl font-black tracking-tight">
            BARAKA<span className="text-black/35">NEST</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link
              href="/houses"
              className="transition-opacity hover:opacity-50"
            >
              Houses
            </Link>

            <Link
              href="/roommates"
              className="font-semibold transition-opacity hover:opacity-50"
            >
              Roommates
            </Link>
          </div>

          <Link
            href="/roommates"
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            Back to roommates
          </Link>
        </div>
      </nav>

      <section className="border-b border-black/10 bg-[#f7f7f5]">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
            Baraka Nest · Roommates
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Create your
            <br />
            <span className="text-black/30">roommate profile.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">
            Tell students a little about yourself, your budget and the kind of
            home you want. The right roommate could be one profile away.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20"
      >
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              01 · Basic information
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Start with the basics.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-bold">Full name</label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Age</label>

              <input
                type="number"
                min="16"
                max="100"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="22"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="text-sm font-bold">School / University</label>

              <input
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                placeholder="Your school"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        <div className="my-16 border-t border-black/10" />

        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              02 · Housing preferences
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              What are you looking for?
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold">Preferred area</label>

              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              >
                <option value="">Select an area</option>

                {locationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold">
                Monthly roommate budget
              </label>

              <div className="relative mt-2">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">
                  KSh
                </span>

                <input
                  type="number"
                  min="500"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="8500"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-14 py-4 outline-none transition focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold">Move-in time</label>

              <input
                value={moveIn}
                onChange={(event) => setMoveIn(event.target.value)}
                placeholder="January 2027"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Roommate preference</label>

              <input
                value={preference}
                onChange={(event) => setPreference(event.target.value)}
                placeholder="Quiet & clean"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        <div className="my-16 border-t border-black/10" />

        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              03 · How you live
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Help people understand your lifestyle.
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Select everything that describes you.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.map((item) => {
              const selected = lifestyle.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleOption(item, lifestyle, setLifestyle)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-[#f7f7f5] hover:border-black/30"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <div className="my-16 border-t border-black/10" />

        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              04 · Your interests
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              What are you into?
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {interestOptions.map((item) => {
              const selected = interests.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleOption(item, interests, setInterests)}
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-[#f7f7f5] hover:border-black/30"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <div className="my-16 border-t border-black/10" />

        <section>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
              05 · About you
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Say a little more.
            </h2>
          </div>

          <textarea
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            placeholder="Tell potential roommates about yourself, your routine, what kind of home you want and anything else that matters..."
            required
            rows={7}
            className="w-full resize-none rounded-3xl border border-black/10 bg-[#f7f7f5] px-5 py-5 leading-7 outline-none transition focus:border-black"
          />

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-5 text-black/40">
              Your profile will only be created after you submit this form.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-black px-8 py-4 text-sm font-black text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating profile..." : "Create Profile"}
            </button>
          </div>
        </section>
      </form>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="text-lg font-black tracking-tight">
              BARAKA<span className="text-black/35">NEST</span>
            </div>

            <p className="mt-1 text-xs text-black/40">
              Better student living, together.
            </p>
          </div>

          <Link
            href="/roommates"
            className="text-sm font-semibold text-black/50 transition hover:text-black"
          >
            Browse roommates →
          </Link>
        </div>
      </footer>
    </main>
  );
}