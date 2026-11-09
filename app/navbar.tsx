"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "./language-context";

const translations = {
  English: {
    home: "Home",
    houses: "Houses",
    find: "Find my place",
    roommates: "Roommates",
    messages: "Messages",
    connections: "Connections",
    notifications: "Notifications",
    dashboard: "Dashboard",
    profile: "Profile",
    contact: "Contact",
    contactAdmin: "Contact admin",
    more: "More",
    language: "Language",
    admin: "Admin Centre",
    logout: "Log out",
  },
  Swahili: {
    home: "Nyumbani",
    houses: "Nyumba",
    find: "Pata makazi",
    roommates: "Roommates",
    messages: "Ujumbe",
    connections: "Connections",
    notifications: "Arifa",
    dashboard: "Dashboard",
    profile: "Wasifu",
    contact: "Wasiliana",
    contactAdmin: "Wasiliana na admin",
    more: "Zaidi",
    language: "Lugha",
    admin: "Admin Centre",
    logout: "Toka",
  },
  Sheng: {
    home: "Home",
    houses: "Keja",
    find: "Nipatie place",
    roommates: "Roommates",
    messages: "Messages",
    connections: "Connections",
    notifications: "Arifa",
    dashboard: "Dashboard",
    profile: "Profile",
    contact: "Contact",
    contactAdmin: "Contact admin",
    more: "More",
    language: "Lugha",
    admin: "Admin Centre",
    logout: "Toka",
  },
};

const primaryLinks = [
  { href: "/", key: "home", icon: "⌂" },
  { href: "/houses", key: "houses", icon: "▦" },
  { href: "/find-my-place", key: "find", icon: "⌕" },
  { href: "/roommates", key: "roommates", icon: "◎" },
  { href: "/messages", key: "messages", icon: "◌" },
] as const;

const moreLinks = [
  { href: "/roommates/connections", key: "connections" },
  { href: "/notifications", key: "notifications" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/profile", key: "profile" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [canAdmin, setCanAdmin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    let activeRequest = true;
    fetch("/api/admin/access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { allowed: false })
      .then((result: { allowed?: boolean }) => { if (activeRequest) setCanAdmin(result.allowed === true); })
      .catch(() => { if (activeRequest) setCanAdmin(false); });
    return () => { activeRequest = false; };
  }, [pathname]);

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // Still return to sign-in if the network is interrupted.
    } finally {
      setCanAdmin(false);
      setLoggingOut(false);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e8ebe5] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="shrink-0 text-lg font-extrabold tracking-[-0.055em] text-[#183b2c] sm:text-2xl">
            Baraka<span className="text-[#e58b45]">Nest.</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2.5 text-[13px] font-semibold transition-colors ${active(link.href) ? "bg-[#edf3ed] text-[#183b2c]" : "text-[#647067] hover:bg-[#f5f7f3] hover:text-[#183b2c]"}`}
              >
                {t[link.key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/contact"
              className="hidden xl:inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#e58b45] px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(229,139,69,0.2)] transition hover:bg-[#cc7130]"
            >
              <span aria-hidden="true">✉</span>{t.contactAdmin}
            </Link>
            {canAdmin && <Link href="/nest-control-panel" aria-label={t.admin} title={t.admin} className="whitespace-nowrap rounded-full bg-[#183b2c] px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#285640] sm:px-3 sm:py-2 sm:text-sm"><span className="sm:hidden">Admin</span><span className="hidden sm:inline">{t.admin}</span></Link>}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              aria-label={t.language}
              className="w-[68px] max-w-[68px] rounded-full border border-[#e3e7df] bg-white px-1.5 py-2 text-[10px] font-semibold text-[#183b2c] outline-none focus:border-[#183b2c] sm:w-auto sm:max-w-none sm:px-3 sm:text-sm"
            >
              <option value="English">English</option>
              <option value="Swahili">Kiswahili</option>
              <option value="Sheng">Sheng</option>
            </select>
            <div className="relative">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((open) => !open)}
                className={`flex h-9 items-center gap-1 rounded-full border border-[#e3e7df] px-3 text-xs font-bold transition hover:bg-[#f5f7f3] sm:h-10 sm:text-sm ${moreOpen ? "bg-[#edf3ed] text-[#183b2c]" : "text-[#526258]"}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183b2c] text-[10px] text-white">B</span>
                <span className="hidden sm:inline">{t.more}</span>
                <span aria-hidden="true">⌄</span>
              </button>
              {moreOpen && (
                <div role="menu" className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-2xl border border-[#e5ebe3] bg-white p-2 shadow-[0_18px_48px_rgba(24,59,44,0.16)]">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active(link.href) ? "bg-[#edf3ed] text-[#183b2c]" : "text-[#647067] hover:bg-[#f5f7f3] hover:text-[#183b2c]"}`}
                    >
                      {t[link.key]}
                    </Link>
                  ))}
                  <Link href="/contact" role="menuitem" onClick={() => setMoreOpen(false)} className="mt-1 block rounded-xl bg-[#fff4e9] px-3 py-2.5 text-sm font-bold text-[#a95720] xl:hidden">
                    {t.contactAdmin}
                  </Link>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label={t.logout}
              className="rounded-full px-1.5 py-2 text-xs font-semibold text-[#647067] transition hover:bg-[#f5f7f3] hover:text-[#183b2c] disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden" aria-hidden="true">↪</span>
              <span className="hidden sm:inline">{loggingOut ? "…" : t.logout}</span>
            </button>
          </div>
        </div>

      </header>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#e8ebe5] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-8px_28px_rgba(24,59,44,0.08)] backdrop-blur-xl xl:hidden">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active(link.href) ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-colors ${active(link.href) ? "text-[#183b2c]" : "text-[#7a867f]"}`}
          >
            <span className={`flex h-7 w-8 items-center justify-center rounded-full text-lg ${active(link.href) ? "bg-[#edf3ed]" : ""}`} aria-hidden="true">{link.icon}</span>
            <span className="max-w-full truncate">{t[link.key]}</span>
          </Link>
        ))}
      </nav>
      <Link href="/contact" className="fixed bottom-[4.8rem] right-3 z-40 inline-flex items-center gap-2 rounded-full bg-[#e58b45] px-4 py-3 text-xs font-extrabold text-white shadow-[0_8px_24px_rgba(126,73,36,0.28)] transition hover:-translate-y-0.5 hover:bg-[#cc7130] xl:hidden sm:right-5 sm:px-5 sm:text-sm">
        <span aria-hidden="true">✉</span>{t.contactAdmin}
      </Link>
    </>
  );
}
