"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "../language-context";

const translations = {
  English: {
    welcome: "Welcome back",
    title: "Your space.",
    title2: "Your community.",
    description:
      "Pick up where you left off and continue finding the right home and roommate for your student life.",
    builtForStudents: "Baraka Nest · Built for students",
    loginTitle: "Log in",
    loginDescription: "Continue to your Baraka Nest account.",
    username: "Username",
    usernamePlaceholder: "Your username",
    password: "Password",
    passwordPlaceholder: "Your password",
    hide: "Hide",
    show: "Show",
    loggingIn: "Logging you in...",
    login: "Log in",
    newHere: "New to Baraka Nest?",
    createAccount: "Create an account",
    noEmail:
      "No email required. Your username is your identity on Baraka Nest.",
    invalidCredentials: "Invalid username or password.",
    tryAgain: "Something went wrong. Please try again.",
  },

  Swahili: {
    welcome: "Karibu tena",
    title: "Nafasi yako.",
    title2: "Jamii yako.",
    description:
      "Endelea ulipoishia na utafute nyumba na roommate anayekufaa kwa maisha yako ya chuo.",
    builtForStudents: "Baraka Nest · Imetengenezwa kwa wanafunzi",
    loginTitle: "Ingia",
    loginDescription: "Endelea kwenye akaunti yako ya Baraka Nest.",
    username: "Username",
    usernamePlaceholder: "Username yako",
    password: "Password",
    passwordPlaceholder: "Password yako",
    hide: "Ficha",
    show: "Onyesha",
    loggingIn: "Inaingia...",
    login: "Ingia",
    newHere: "Ni mgeni Baraka Nest?",
    createAccount: "Tengeneza akaunti",
    noEmail:
      "Email haihitajiki. Username yako ndiyo utambulisho wako Baraka Nest.",
    invalidCredentials: "Username au password si sahihi.",
    tryAgain: "Kuna tatizo. Tafadhali jaribu tena.",
  },

  Sheng: {
    welcome: "Umerudi tena",
    title: "Place yako.",
    title2: "Wasee wako.",
    description:
      "Endelea ulipoachia na usake home na roommate mwenye anafit student life yako.",
    builtForStudents: "Baraka Nest · Imetengenezwa for students",
    loginTitle: "Log in",
    loginDescription: "Endelea na Baraka Nest account yako.",
    username: "Username",
    usernamePlaceholder: "Username yako",
    password: "Password",
    passwordPlaceholder: "Password yako",
    hide: "Ficha",
    show: "Show",
    loggingIn: "Ina-log in...",
    login: "Log in",
    newHere: "Ni mgeni Baraka Nest?",
    createAccount: "Create account",
    noEmail:
      "Email haihitajiki. Username yako ndio identity yako Baraka Nest.",
    invalidCredentials: "Username ama password si sahihi.",
    tryAgain: "Kuna noma imehappen. Try tena.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

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
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.invalidCredentials);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(t.tryAgain);
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
                {t.welcome}
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                {t.title}
                <br />
                {t.title2}
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
                {t.description}
              </p>
            </div>

            <p className="text-sm text-white/30">
              {t.builtForStudents}
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:bg-white lg:text-black">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:mb-10">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight lg:hidden"
              >
                Baraka<span className="text-white/40">Nest</span>
              </Link>

              <div className="ml-auto flex rounded-full border border-white/10 bg-white/[0.05] p-1 lg:border-black/10 lg:bg-black/[0.03]">
                {(["English", "Swahili", "Sheng"] as Language[]).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                        currentLanguage === item
                          ? "bg-white text-black lg:bg-black lg:text-white"
                          : "text-white/50 hover:text-white lg:text-black/40 lg:hover:text-black"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-white/40 lg:text-black/40">
                {t.welcome}
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em]">
                {t.loginTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/50 lg:text-black/50">
                {t.loginDescription}
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-9 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.username}
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                  autoComplete="username"
                  required
                  className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-white/[0.04] lg:border-black/10 lg:bg-black/[0.025] lg:text-black lg:placeholder:text-black/30 lg:focus:border-black/30 lg:focus:bg-white lg:focus:ring-black/[0.04]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.password}
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    autoComplete="current-password"
                    required
                    className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 pr-20 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-white/[0.04] lg:border-black/10 lg:bg-black/[0.025] lg:text-black lg:placeholder:text-black/30 lg:focus:border-black/30 lg:focus:bg-white lg:focus:ring-black/[0.04]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white lg:text-black/40 lg:hover:text-black"
                  >
                    {showPassword ? t.hide : t.show}
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
                className="h-13 w-full rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50 lg:bg-black lg:text-white lg:hover:bg-black/85"
              >
                {loading ? t.loggingIn : t.login}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/45 lg:text-black/45">
              {t.newHere}{" "}
              <Link
                href="/register"
                className="font-semibold text-white transition hover:opacity-60 lg:text-black"
              >
                {t.createAccount}
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-white/30 lg:text-black/30">
              {t.noEmail}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}