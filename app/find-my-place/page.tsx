"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar";
import { useLanguage } from "../language-context";
import { getMapSearchUrl, houses as sampleHouses } from "@/lib/houses";

const content = {
  English: {
    eyebrow: "A good place starts with what matters to you",
    title: "Find your place.",
    intro: "A few quick choices help us sort the homes that fit your student life.",
    step: "Step", of: "of", next: "Continue", back: "Back", results: "Show my matches",
    areaTitle: "Where are you studying or hoping to live?",
    areaText: "Enter a campus, neighbourhood, town or county. Leave it open if you can live anywhere.",
    area: "Campus, area or county", areaHint: "For example, Juja or Nairobi",
    budgetTitle: "What monthly rent works for you?",
    budgetText: "Set a realistic ceiling in Kenyan shillings. You can change it later.",
    budget: "Maximum monthly rent", anyBudget: "No fixed limit",
    homeTitle: "What kind of place feels right?",
    homeText: "Pick a home type and anything you would like nearby.",
    type: "Home type", anyType: "Any type", amenities: "Helpful features",
    options: ["Reliable water", "Wi-Fi available", "24/7 security", "Nearby shops", "Public transport nearby"],
    matches: "Your best matches", matchesText: "Homes are ordered by how closely they fit the choices you made.",
    match: "fit", view: "View home", map: "Explore nearby places", restart: "Change answers",
    noResults: "No listings match every choice yet.", noResultsText: "Try a larger budget or broader area. We only show currently listed homes here.",
    progress: ["Area", "Budget", "Home style"],
    loadError: "Live listings could not refresh. These recommendations may be out of date.",
  },
  Swahili: {
    eyebrow: "Makazi mazuri huanza na mambo muhimu kwako",
    title: "Pata makazi yako.", intro: "Chaguo chache zitatusaidia kupanga nyumba zinazofaa maisha yako ya chuo.",
    step: "Hatua", of: "kati ya", next: "Endelea", back: "Rudi", results: "Nionyeshe zinazofaa",
    areaTitle: "Unasoma au ungependa kuishi wapi?",
    areaText: "Andika chuo, mtaa, mji au kaunti. Acha wazi ikiwa unaweza kuishi popote.",
    area: "Chuo, eneo au kaunti", areaHint: "Kwa mfano, Juja au Nairobi",
    budgetTitle: "Kodi ya mwezi inayokufaa ni kiasi gani?",
    budgetText: "Weka kiwango cha juu kwa shilingi za Kenya. Unaweza kukibadilisha baadaye.",
    budget: "Kodi ya juu kwa mwezi", anyBudget: "Sina kiwango maalum",
    homeTitle: "Unapendelea nyumba ya aina gani?",
    homeText: "Chagua aina ya nyumba na huduma unazotaka karibu.",
    type: "Aina ya nyumba", anyType: "Aina yoyote", amenities: "Huduma zinazokusaidia",
    options: ["Maji ya uhakika", "Wi-Fi inapatikana", "Usalama wa saa 24/7", "Maduka karibu", "Usafiri wa umma karibu"],
    matches: "Nyumba zinazokufaa", matchesText: "Nyumba zimepangwa kulingana na chaguo zako.",
    match: "zinafaa", view: "Angalia nyumba", map: "Angalia maeneo ya karibu", restart: "Badilisha majibu",
    noResults: "Hakuna tangazo linalolingana na kila chaguo bado.", noResultsText: "Jaribu kuongeza budget au kupanua eneo. Tunaonyesha nyumba zilizoorodheshwa sasa tu.",
    progress: ["Eneo", "Budget", "Aina ya nyumba"],
    loadError: "Hatukuweza kusasisha matangazo. Mapendekezo haya yanaweza kuwa ya zamani.",
  },
  Sheng: {
    eyebrow: "Place poa inaanza na vitu muhimu kwako",
    title: "Nipatie place.", intro: "Chagua vitu chache tupange nyumba zinafit life yako ya campus.",
    step: "Step", of: "ya", next: "Endelea", back: "Rudi", results: "Nionyeshe matches",
    areaTitle: "Unasoma ama unadai kuishi wapi?",
    areaText: "Andika campus, estate, town ama county. Acha wazi kama uko sawa kuishi popote.",
    area: "Campus, area ama county", areaHint: "Kama Juja ama Nairobi",
    budgetTitle: "Rent ya mwezi unaeza afford ni ngapi?",
    budgetText: "Set kiwango ya juu in KSh. Unaweza change baadaye.",
    budget: "Rent ya juu per month", anyBudget: "Sina limit fixed",
    homeTitle: "Unadai place ya aina gani?",
    homeText: "Chagua type na vitu ungependa karibu na keja.",
    type: "Aina ya keja", anyType: "Any type", amenities: "Vitu zitakusaidia",
    options: ["Maji iko sawa", "Wi-Fi iko available", "Security 24/7", "Shops ziko karibu", "Matatu iko karibu"],
    matches: "Places zimefit", matchesText: "Tumezipanga kulingana na vile umechagua.",
    match: "fit", view: "Check keja", map: "Check maeneo karibu", restart: "Change answers",
    noResults: "Hakuna listing imefit kila kitu bado.", noResultsText: "Jaribu kuongeza budget ama kupanua area. Tunaonyesha nyumba zilizo-listed sai.",
    progress: ["Area", "Budget", "Aina ya keja"],
    loadError: "Live listings hazikuload. Hizi matches zinaweza kuwa za zamani.",
  },
} as const;

const amenities = ["Reliable water", "Wi-Fi available", "24/7 security", "Nearby shops", "Public transport nearby"];

export default function FindMyPlacePage() {
  const { language } = useLanguage();
  const t = content[language];
  const [listings, setListings] = useState(sampleHouses);
  const [listingError, setListingError] = useState(false);
  const [step, setStep] = useState(0);
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState(0);
  const [type, setType] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/houses", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Listings unavailable");
      return response.json();
    }).then((data) => {
      if (!active) return;
      if (Array.isArray(data.houses)) setListings(data.houses);
      else throw new Error("Invalid listings response");
    }).catch(() => { if (active) setListingError(true); });
    return () => { active = false; };
  }, []);

  const matches = useMemo(() => listings.map((house) => {
    const locationMatch = !area.trim() || house.location.toLowerCase().includes(area.trim().toLowerCase()) || house.county.toLowerCase().includes(area.trim().toLowerCase());
    const budgetMatch = !budget || house.price <= budget;
    const typeMatch = !type || house.type === type;
    const featuresMatch = !features.length || features.some((feature) => house.amenities.includes(feature));
    const checks = [locationMatch, budgetMatch, typeMatch, featuresMatch];
    const score = Math.round(checks.reduce((total, checked) => total + (checked ? 25 : 0), 0));
    return { house, checks, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score), [area, budget, type, features, listings]);

  function toggleFeature(value: string) {
    setFeatures((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {listingError && <p role="status" className="mb-4 rounded-2xl border border-[#ead9c7] bg-[#fff8f0] px-4 py-3 text-sm leading-6 text-[#82532f]">{t.loadError}</p>}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <aside className="rounded-[28px] bg-[#183b2c] p-6 text-white sm:p-8 lg:sticky lg:top-28 lg:h-fit">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-white/60">{t.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{t.intro}</p>
            <ol className="mt-8 space-y-3">
              {t.progress.map((label, index) => (
                <li key={label} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${step === index || step === 3 && index === 2 ? "bg-white/15 text-white" : "text-white/55"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= index ? "bg-[#e58b45] text-white" : "border border-white/25"}`}>{index + 1}</span>{label}
                </li>
              ))}
            </ol>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#e58b45] transition-all" style={{ width: `${step === 3 ? 100 : (step + 1) * 33.33}%` }} />
            </div>
          </aside>

          <section className="min-w-0">
            {step < 3 ? (
              <div className="rounded-[28px] border border-[#e5ebe3] bg-white p-5 shadow-[0_14px_40px_rgba(24,59,44,0.05)] sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8a958e]">{t.step} {step + 1} {t.of} 3</p>
                {step === 0 && <>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-[#183b2c]">{t.areaTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#738078]">{t.areaText}</p>
                  <label className="mt-8 block text-sm font-bold text-[#34443a]" htmlFor="place-area">{t.area}</label>
                  <input id="place-area" value={area} onChange={(event) => setArea(event.target.value)} placeholder={t.areaHint} className="mt-2 min-h-14 w-full rounded-2xl border border-[#dfe6dd] bg-[#fbfcfa] px-4 text-base outline-none focus:border-[#79947f] focus:bg-white" />
                </>}
                {step === 1 && <>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-[#183b2c]">{t.budgetTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#738078]">{t.budgetText}</p>
                  <label className="mt-8 block text-sm font-bold text-[#34443a]" htmlFor="place-budget">{t.budget}</label>
                  <select id="place-budget" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-2 min-h-14 w-full rounded-2xl border border-[#dfe6dd] bg-[#fbfcfa] px-4 text-base outline-none focus:border-[#79947f]">
                    <option value={0}>{t.anyBudget}</option>
                    {[7000, 8000, 10000, 12500, 15000, 20000].map((amount) => <option key={amount} value={amount}>KSh {amount.toLocaleString()}</option>)}
                  </select>
                </>}
                {step === 2 && <>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-[#183b2c]">{t.homeTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#738078]">{t.homeText}</p>
                  <label className="mt-7 block text-sm font-bold text-[#34443a]" htmlFor="place-type">{t.type}</label>
                  <select id="place-type" value={type} onChange={(event) => setType(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#dfe6dd] bg-[#fbfcfa] px-4 text-sm outline-none focus:border-[#79947f]">
                    <option value="">{t.anyType}</option>{["Single Room", "Bedsitter", "Studio"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                  <fieldset className="mt-6">
                    <legend className="text-sm font-bold text-[#34443a]">{t.amenities}</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {amenities.map((item, index) => (
                        <label key={item} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-3 text-sm transition ${features.includes(item) ? "border-[#9bb39e] bg-[#f0f5ef] text-[#183b2c]" : "border-[#e5ebe3] text-[#657168] hover:bg-[#fafbf9]"}`}>
                          <input type="checkbox" checked={features.includes(item)} onChange={() => toggleFeature(item)} className="h-4 w-4 accent-[#183b2c]" />{t.options[index]}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>}
                <div className="mt-9 flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-between">
                  <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="min-h-12 rounded-full px-5 text-sm font-bold text-[#68756c] hover:bg-[#f2f5f0] disabled:invisible">{t.back}</button>
                  <button type="button" onClick={() => setStep((value) => value === 2 ? 3 : value + 1)} className="min-h-12 rounded-full bg-[#183b2c] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#285640]">{step === 2 ? t.results : t.next}</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div><h2 className="text-2xl font-extrabold tracking-[-0.04em] text-[#183b2c]">{t.matches}</h2><p className="mt-1 text-sm text-[#78847c]">{t.matchesText}</p></div>
                  <button onClick={() => setStep(0)} className="min-h-10 rounded-full border border-[#dfe6dd] px-4 text-xs font-bold text-[#526258] hover:bg-white">{t.restart}</button>
                </div>
                {matches.length ? <div className="mt-5 space-y-3">
                  {matches.map(({ house, checks, score }) => (
                    <article key={house.id} className="rounded-[24px] border border-[#e5ebe3] bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="text-xs font-semibold text-[#839087]">{house.location} · {house.type}</p><h3 className="mt-1 text-lg font-extrabold text-[#26352b]">{house.name}</h3></div>
                        <span className="rounded-full bg-[#edf3ed] px-3 py-1.5 text-xs font-extrabold text-[#183b2c]">{score}% {t.match}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#66736a]">
                        <span className={checks[0] ? "text-[#2a6c45]" : ""}>{checks[0] ? "✓" : "·"} {house.location}</span>
                        <span className={checks[1] ? "text-[#2a6c45]" : ""}>{checks[1] ? "✓" : "·"} KSh {house.price.toLocaleString()}/mo</span>
                        <span className={checks[2] ? "text-[#2a6c45]" : ""}>{checks[2] ? "✓" : "·"} {house.type}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/houses/${house.id}`} className="inline-flex min-h-10 items-center rounded-full bg-[#183b2c] px-4 text-xs font-bold text-white hover:bg-[#285640]">{t.view}</Link>
                        <a href={getMapSearchUrl(house.location, "shopping centre")} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-[#dfe6dd] px-4 text-xs font-bold text-[#526258] hover:bg-[#f5f7f3]">{t.map}</a>
                      </div>
                    </article>
                  ))}
                </div> : <div className="mt-6 rounded-[24px] border border-dashed border-[#d8e0d6] bg-white p-8 text-center"><p className="font-bold text-[#34443a]">{t.noResults}</p><p className="mt-2 text-sm text-[#78847c]">{t.noResultsText}</p><button onClick={() => setStep(0)} className="mt-4 min-h-11 rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white">{t.restart}</button></div>}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
