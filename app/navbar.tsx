"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "./language-context";

const translations = {
  English: {
    home: "Home",
    houses: "Houses",
    roommates: "Roommates",
    connections: "Connections",
    notifications: "Notifications",
    profile: "Profile",
    logout: "Log out",
    language: "Language",
  },
  Swahili: {
    home: "Nyumbani",
    houses: "Nyumba",
    roommates: "Wapangaji",
    connections: "Connections",
    notifications: "Arifa",
    profile: "Wasifu",
    logout: "Toka",
    language: "Lugha",
  },
  Sheng: {
    home: "Home",
    houses: "Keja",
    roommates: "Roommates",
    connections: "Connections",
    notifications: "Arifa",
    profile: "Profile",
    logout: "Toka",
    language: "Lugha",
  },
};

const links = [
  { href: "/dashboard", key: "home" },
  { href: "/houses", key: "houses" },
  { href: "/roommates", key: "roommates" },
  { href: "/roommates/connections", key: "connections" },
  { href: "/notifications", key: "notifications" },
  { href: "/profile", key: "profile" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  async function handleLogout() {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8ebe5] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/dashboard"
          className="shrink-0 text-xl font-bold tracking-tight text-[#183b2c] sm:text-2xl"
        >
          Baraka<span className="text-[#e58b45]">Nest.</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname.startsWith(`${link.href}/`));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#edf2ed] text-[#183b2c]"
                    : "text-[#647067] hover:bg-[#f5f7f3] hover:text-[#183b2c]"
                }`}
              >
                {t[link.key]}

                {link.key === "notifications" && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[#e58b45]" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as typeof language)
            }
            aria-label={t.language}
            className="hidden rounded-full border border-[#e3e7df] bg-white px-3 py-2 text-sm font-semibold text-[#183b2c] outline-none focus:border-[#183b2c] sm:block"
          >
            <option value="English">English</option>
            <option value="Swahili">Kiswahili</option>
            <option value="Sheng">Sheng</option>
          </select>

          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#183b2c] text-sm font-bold text-white transition hover:scale-105"
            aria-label={t.profile}
          >
            U
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#647067] transition hover:bg-[#f5f7f3] hover:text-[#183b2c] md:block"
          >
            {t.logout}
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-t border-[#f0f1ee] px-3 py-2 md:hidden">
        {links.slice(0, 5).map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" &&
              pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-[#183b2c] text-white"
                  : "text-[#647067] hover:bg-[#f3f5f1]"
              }`}
            >
              {t[link.key]}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-[#647067]"
        >
          {t.logout}
        </button>
      </div>
    </nav>
  );
}