"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid username or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-[#171717] via-[#0a0a0a] to-black" />

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Baraka<span className="text-white/40">Nest</span>
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60">
                Welcome back
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Your space.
                <br />
                Your community.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
                Pick up where you left off and continue finding the right home
                and roommate for your student life.
              </p>
            </div>

            <p className="text-sm text-white/30">
              Baraka Nest · Built for students
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:bg-white lg:text-black">
          <div className="w-full max-w-md">

            <div className="mb-10 lg:hidden">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                Baraka<span className="text-white/40">Nest</span>
              </Link>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-black/40">
                Welcome back
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em]">
                Log in
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Continue to your Baraka Nest account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-9 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  autoComplete="username"
                  required
                  className="h-13 w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    required
                    className="h-13 w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/40 hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-13 w-full rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging you in..." : "Log in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-black/45">
              New to Baraka Nest?{" "}
              <Link
                href="/register"
                className="font-semibold text-black transition hover:opacity-60"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-black/30">
              No email required. Your username is your identity on Baraka Nest.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}