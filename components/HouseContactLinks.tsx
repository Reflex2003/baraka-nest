import type { HouseContactMethod } from "@/lib/houses";

const glyph: Record<HouseContactMethod["platform"], string> = { phone: "☎", whatsapp: "◉", instagram: "◎", facebook: "f", telegram: "➤", tiktok: "♪", x: "𝕏", link: "↗" };

export default function HouseContactLinks({ methods = [] }: { methods?: HouseContactMethod[] }) {
  if (!methods.length) return null;
  return <nav aria-label="Listing contact methods" className="flex flex-wrap gap-2 border-t border-black/[0.07] px-5 py-3">
    {methods.map((method, index) => <a key={`${method.platform}-${index}`} href={method.url} aria-label={method.label} title={method.label} target={method.kind === "phone" ? undefined : "_blank"} rel={method.kind === "phone" ? undefined : "noopener noreferrer"} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-[#e2e9e0] bg-white px-3 text-xs font-semibold text-[#355342] transition hover:border-[#9bb19d] hover:bg-[#f3f6f1] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183b2c]">
      <span aria-hidden="true" className="text-sm">{glyph[method.platform] ?? glyph.link}</span><span className="sr-only sm:not-sr-only">{method.label}</span>
    </a>)}
  </nav>;
}
