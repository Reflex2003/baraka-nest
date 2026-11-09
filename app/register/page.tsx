"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "../language-context";

const translations = {
  English: {
    builtForStudents: "Built for students",
    title: "Find your place.",
    title2: "Find your people.",
    description:
      "Baraka Nest makes finding student-friendly homes and compatible roommates simpler, safer and more convenient.",
    nextChapter: "Your next chapter starts here.",
    getStarted: "Get started",
    createTitle: "Create your account",
    createDescription:
      "Choose a username and password. No email required.",
    username: "Username",
    usernamePlaceholder: "Choose your username",
    usernameHint:
      "3–20 characters · letters, numbers and underscore",
    password: "Password",
    passwordPlaceholder: "Create a password",
    passwordHint:
      "At least 6 characters with a letter and a number",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Repeat your password",
    hide: "Hide",
    show: "Show",
    creating: "Creating your account...",
    createAccount: "Create account",
    alreadyAccount: "Already have an account?",
    login: "Log in",
    agreePrefix: "I agree to the ",
    agreeJoin: " and acknowledge the ",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    policyRequired: "Please accept the Terms of Service and acknowledge the Privacy Policy to continue.",
    passwordsMismatch: "Your passwords do not match.",
    passwordRequirements:
      "Password must be at least 6 characters and contain a letter and a number.",
    accountError: "Unable to create your account.",
    tryAgain: "Something went wrong. Please try again.",
  },

  Swahili: {
    builtForStudents: "Imetengenezwa kwa wanafunzi",
    title: "Pata sehemu yako.",
    title2: "Pata watu wako.",
    description:
      "Baraka Nest inarahisisha kupata nyumba zinazofaa wanafunzi na roommates wanaokufaa kwa njia rahisi, salama na convenient.",
    nextChapter: "Sura yako inayofuata inaanzia hapa.",
    getStarted: "Anza hapa",
    createTitle: "Tengeneza akaunti yako",
    createDescription:
      "Chagua username na password. Email haihitajiki.",
    username: "Username",
    usernamePlaceholder: "Chagua username yako",
    usernameHint:
      "Herufi 3–20 · letters, numbers na underscore",
    password: "Password",
    passwordPlaceholder: "Tengeneza password",
    passwordHint:
      "Angalau herufi 6 ikiwa na letter na number",
    confirmPassword: "Thibitisha password",
    confirmPlaceholder: "Rudia password yako",
    hide: "Ficha",
    show: "Onyesha",
    creating: "Inatengeneza akaunti...",
    createAccount: "Tengeneza akaunti",
    alreadyAccount: "Tayari una akaunti?",
    login: "Ingia",
    agreePrefix: "Ninakubali ",
    agreeJoin: " na nathibitisha kuwa nimesoma ",
    termsLink: "Masharti ya Matumizi",
    privacyLink: "Sera ya Faragha",
    policyRequired: "Tafadhali kubali Masharti ya Matumizi na uthibitishe kuwa umesoma Sera ya Faragha ili uendelee.",
    passwordsMismatch: "Password zako hazifanani.",
    passwordRequirements:
      "Password lazima iwe na angalau herufi 6, letter moja na number moja.",
    accountError: "Imeshindikana kutengeneza akaunti yako.",
    tryAgain: "Kuna tatizo. Tafadhali jaribu tena.",
  },

  Sheng: {
    builtForStudents: "Imebuildiwa wasee wa campus",
    title: "Pata place yako.",
    title2: "Pata wasee wako.",
    description:
      "Baraka Nest inafanya kusaka student homes na roommates wenye mnafit ikuwe simple, safe na convenient.",
    nextChapter: "Chapter yako ingine inaanzia hapa.",
    getStarted: "Anza hapa",
    createTitle: "Create account yako",
    createDescription:
      "Chagua username na password. Email si lazima.",
    username: "Username",
    usernamePlaceholder: "Chagua username yako",
    usernameHint:
      "Characters 3–20 · letters, numbers na underscore",
    password: "Password",
    passwordPlaceholder: "Create password",
    passwordHint:
      "At least 6 characters ikiwa na letter na number",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Rudia password yako",
    hide: "Ficha",
    show: "Show",
    creating: "Inacreate account...",
    createAccount: "Create account",
    alreadyAccount: "Uko na account tayari?",
    login: "Log in",
    agreePrefix: "Nakubali ",
    agreeJoin: " na nimesoma ",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    policyRequired: "Kubali Terms of Service na uthibitishe umesoma Privacy Policy ndio uendelee.",
    passwordsMismatch: "Passwords zako hazifanyi match.",
    passwordRequirements:
      "Password lazima ikuwe na characters 6+, letter na number.",
    accountError: "Account haikuweza kucreate.",
    tryAgain: "Kuna noma imehappen. Try tena.",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!acceptedPolicies) {
      setError(t.policyRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(t.passwordRequirements);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          acceptedPolicies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.accountError);
        return;
      }

      router.push("/");
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
                {t.builtForStudents}
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
              {t.nextChapter}
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
                {t.getStarted}
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em]">
                {t.createTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/50 lg:text-black/50">
                {t.createDescription}
              </p>
            </div>

            <form onSubmit={handleRegister} className="mt-9 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.username}
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                  required
                  className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-white/[0.04] lg:border-black/10 lg:bg-black/[0.025] lg:text-black lg:placeholder:text-black/30 lg:focus:border-black/30 lg:focus:bg-white lg:focus:ring-black/[0.04]"
                />

                <p className="mt-2 text-xs text-white/35 lg:text-black/35">
                  {t.usernameHint}
                </p>
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
                    minLength={6}
                    autoComplete="new-password"
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

                <p className="mt-2 text-xs text-white/35 lg:text-black/35">
                  {t.passwordHint}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.confirmPassword}
                </label>

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPlaceholder}
                    autoComplete="new-password"
                    required
                    className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 pr-20 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-white/[0.04] lg:border-black/10 lg:bg-black/[0.025] lg:text-black lg:placeholder:text-black/30 lg:focus:border-black/30 lg:focus:bg-white lg:focus:ring-black/[0.04]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white lg:text-black/40 lg:hover:text-black"
                  >
                    {showConfirm ? t.hide : t.show}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs leading-5 text-white/60 lg:border-black/[0.08] lg:bg-black/[0.02] lg:text-black/60">
                <input
                  type="checkbox"
                  checked={acceptedPolicies}
                  onChange={(event) => setAcceptedPolicies(event.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#e58b45]"
                />
                <span>
                  {t.agreePrefix}
                  <Link href="/terms" className="font-bold text-white underline underline-offset-2 hover:opacity-70 lg:text-black">{t.termsLink}</Link>
                  {t.agreeJoin}
                  <Link href="/privacy" className="font-bold text-white underline underline-offset-2 hover:opacity-70 lg:text-black">{t.privacyLink}</Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !acceptedPolicies}
                className="h-13 w-full rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50 lg:bg-black lg:text-white lg:hover:bg-black/85"
              >
                {loading ? t.creating : t.createAccount}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/45 lg:text-black/45">
              {t.alreadyAccount}{" "}
              <Link
                href="/login"
                className="font-semibold text-white transition hover:opacity-60 lg:text-black"
              >
                {t.login}
              </Link>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
