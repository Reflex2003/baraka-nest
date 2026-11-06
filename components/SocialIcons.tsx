"use client";

import { useState } from "react";
import { adminContactChannels } from "@/lib/contact";

const icons: Record<string, React.ReactNode> = {
  whatsapp: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.09.55 4.13 1.6 5.93L.1 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.18-1.24-6.16-3.45-8.41ZM12.09 21.75h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.66-.23-.38a9.86 9.86 0 1 1 8.4 4.64Zm5.42-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  ),

  instagram: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current stroke-2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
    </svg>
  ),

  facebook: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.7V3.96c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.2 1.53-4.2 4.34V10H7.2v3h2.77v8h3.53Z" />
    </svg>
  ),

  threads: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
      aria-hidden="true"
    >
      <path d="M17.5 10.7c-.2-3.1-2.1-5-5.3-5-3.4 0-5.7 2-5.7 6.1 0 4.2 2.3 6.5 6.1 6.5 3.1 0 5.2-1.6 5.2-4.2 0-2.3-1.7-3.7-4.3-3.7-2.2 0-3.5 1.1-3.5 2.8 0 1.5 1.1 2.4 2.7 2.4 2.2 0 3.7-1.8 3.7-4.6 0-4.1-2.2-6.5-6.1-6.5" />
      <path d="M17.5 10.7c2.7.5 4.3 2.1 4.3 4.7 0 3.7-3.1 6.1-7.9 6.1-5.8 0-9.2-3.4-9.2-9.5 0-6 3.2-9.2 8-9.2 4.4 0 7.4 2.5 7.9 6.6" />
    </svg>
  ),

  email: (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current stroke-2"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),

  telegram: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="m21.5 3.3-3.16 17.02c-.24 1.2-.87 1.5-1.76.94l-4.86-3.58-2.35 2.27c-.26.26-.48.48-.98.48l.35-4.96 9.02-8.15c.39-.35-.09-.54-.61-.2L6 14.16l-4.7-1.47c-1.02-.32-1.04-1.02.21-1.5L19.88 4.1c.87-.32 1.63.2 1.62-.8Z" />
    </svg>
  ),
};

const brandStyles: Record<string, string> = {
  whatsapp:
    "text-[#25D366] hover:bg-[#25D366] hover:border-[#25D366] hover:text-white",

  instagram:
    "text-[#E1306C] hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white",

  facebook:
    "text-[#1877F2] hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white",

  threads:
    "text-[#000000] hover:bg-[#000000] hover:border-[#000000] hover:text-white",

  email:
    "text-[#EA4335] hover:bg-[#EA4335] hover:border-[#EA4335] hover:text-white",

  telegram:
    "text-[#229ED9] hover:bg-[#229ED9] hover:border-[#229ED9] hover:text-white",
};

export default function SocialIcons() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("ianmorgan107@gmail.com");
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {adminContactChannels.map((channel) => (
        <a
          key={channel.id}
          href={channel.href}
          target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={
            channel.href.startsWith("mailto:")
              ? undefined
              : "noopener noreferrer"
          }
          aria-label={channel.label}
          title={channel.label}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-[#e1e7e0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-90 ${brandStyles[channel.id]}`}
        >
          {icons[channel.id]}
        </a>
      ))}

      <button
        type="button"
        onClick={copyEmail}
        aria-label="Copy admin email"
        title="Copy admin email"
        className="flex h-11 items-center gap-2 rounded-full border border-[#e1e7e0] bg-white px-4 text-xs font-extrabold text-[#183b2c] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#183b2c] hover:bg-[#183b2c] hover:text-white hover:shadow-lg active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 fill-none stroke-current stroke-2"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
        </svg>

        {copied ? "Copied!" : "Copy Email"}
      </button>
    </div>
  );
}