"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useLanguage } from "../../language-context";
import { kenyaCounties } from "@/lib/kenya-counties";
import { houseTypes } from "@/lib/house-types";
import { uploadUserFile } from "@/lib/client-upload";

const translations = {
  English: { title: "List a house", sub: "Share the details with students. New listings stay pending until an admin reviews them.", name: "Listing name", location: "Area / town", county: "County", type: "House type", rooms: "Rooms", rent: "Monthly rent (KSh)", deposit: "Deposit (KSh)", bills: "Estimated monthly bills (KSh)", phone: "WhatsApp phone number", description: "Description", amenities: "Amenities (comma separated)", media: "Photos or videos (up to 4 total)", submit: "Create listing", busy: "Creating listing…", success: "Listing created. It is pending verification.", safety: "Never ask students to pay before they have viewed the house. Listings are reviewed, but verification does not guarantee availability or a transaction.", back: "Back to houses", error: "Could not create listing." },
  Swahili: { title: "Weka nyumba", sub: "Shiriki maelezo na students. Listing mpya itakaguliwa na admin kwanza.", name: "Jina la listing", location: "Mtaa / town", county: "County", type: "Aina ya nyumba", rooms: "Vyumba", rent: "Kodi ya mwezi (KSh)", deposit: "Deposit (KSh)", bills: "Bills za mwezi (makadirio) (KSh)", phone: "Namba ya WhatsApp", description: "Maelezo", amenities: "Huduma (tenganisha kwa koma)", media: "Picha au video (zisizidi 4 kwa jumla)", submit: "Tengeneza listing", busy: "Inatengeneza…", success: "Listing imetengenezwa, inasubiri ukaguzi.", safety: "Usiwaombe students pesa kabla hawajaona nyumba. Admin hukagua listings, lakini verification haimaanishi nyumba itapatikana au transaction itahakikishwa.", back: "Rudi kwa nyumba", error: "Listing haikuweza kutengenezwa." },
  Sheng: { title: "List keja", sub: "Share details na wasee. Admin atacheki listing kabla iwe verified.", name: "Jina ya listing", location: "Area / town", county: "County", type: "Aina ya keja", rooms: "Rooms", rent: "Rent ya mwezi (KSh)", deposit: "Deposit (KSh)", bills: "Bills za mwezi (estimate) (KSh)", phone: "WhatsApp number", description: "Details", amenities: "Amenities (weka comma)", media: "Pics ama videos (max 4 zote)", submit: "Create listing", busy: "Ina-create listing…", success: "Listing imecreate, inangoja admin aicheck.", safety: "Usiombe wasee watume doh kabla wameona keja. Admin hucheck listings, lakini verification haiguarantee availability ama transaction.", back: "Rudi kwa keja", error: "Listing haikuweza kucreate." },
};

export default function CreateHouseClient() {
  const { language } = useLanguage();
  const t = translations[language];
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (files.length > 4) { setError("A listing can have a maximum of 4 media files."); return; }
    if (files.some((file) => file.size > 100 * 1024 * 1024)) { setError("Each media file must be 100MB or smaller."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/houses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.get("name"), location: form.get("location"), county: form.get("county"), type: form.get("type"), rooms: form.get("rooms"), description: form.get("description"), contactPhone: form.get("phone"), price: Number(form.get("price")), deposit: Number(form.get("deposit") || 0), monthlyBills: Number(form.get("bills") || 0), available: 1, distance: "", lat: Number(form.get("lat")), lon: Number(form.get("lon")), amenities: String(form.get("amenities") || "").split(",").map((item) => item.trim()).filter(Boolean),
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t.error);
      setCreatedId(result.id);
      for (const file of files) {
        const blob = await uploadUserFile(file, { kind: "house-image", houseId: result.id });
        const registered = await fetch("/api/uploads/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "house-image", houseId: result.id, url: blob.url, pathname: blob.pathname, contentType: file.type, size: file.size }) });
        const registration = await registered.json();
        if (!registered.ok) throw new Error(registration.error || "A media file could not be saved. Your listing is still available for review.");
      }
      setMessage(`${t.success} ${files.length ? `${files.length} media file(s) uploaded.` : ""}`);
      formElement.reset(); setFiles([]);
    } catch (issue) { setError(issue instanceof Error ? issue.message : t.error); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#faf9f6] text-[#183b2c]"><Navbar /><div className="mx-auto max-w-3xl px-5 py-8 sm:px-8"><Link href="/houses" className="text-sm font-semibold text-[#587060]">← {t.back}</Link><h1 className="mt-6 text-3xl font-extrabold">{t.title}</h1><p className="mt-2 text-sm leading-6 text-[#63736a]">{t.sub}</p><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t.safety}</div>
    <form onSubmit={submit} className="mt-6 grid gap-4 rounded-3xl border border-[#e5ebe3] bg-white p-5 sm:grid-cols-2 sm:p-7">
      {([["name",t.name,"text"],["location",t.location,"text"],["rooms",t.rooms,"text"],["phone",t.phone,"tel"],["price",t.rent,"number"],["deposit",t.deposit,"number"],["bills",t.bills,"number"],["lat","Latitude","number"],["lon","Longitude","number"],["amenities",t.amenities,"text"]] as const).map(([name,label,type]) => <label key={name} className="grid gap-1.5 text-sm font-semibold">{label}<input name={name} type={type} required={["lat","lon","name","location","rooms","phone","price"].includes(name)} step={type==="number"?"any":undefined} defaultValue={name==="lat"?"-1.2864":name==="lon"?"36.8172":undefined} className="min-h-11 rounded-xl border border-[#dce5db] px-3 font-normal" /></label>)}
      <label className="grid gap-1.5 text-sm font-semibold">{t.county}<select name="county" required className="min-h-11 rounded-xl border border-[#dce5db] px-3 font-normal"><option value="">Choose county</option>{kenyaCounties.map((county)=><option key={county}>{county}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold">{t.type}<select name="type" className="min-h-11 rounded-xl border border-[#dce5db] px-3 font-normal">{houseTypes.map((type)=><option key={type}>{type}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">{t.description}<textarea name="description" required minLength={20} maxLength={2000} rows={5} className="rounded-xl border border-[#dce5db] p-3 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">{t.media}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" onChange={(event)=>{const selected=Array.from(event.target.files??[]);if(selected.length>4){setError("A listing can have a maximum of 4 media files.");event.target.value="";setFiles([]);}else{setError("");setFiles(selected);}}} className="rounded-xl border border-[#dce5db] p-3 font-normal" /><span className="text-xs font-normal text-[#718077]">{files.map((file)=>file.name).join(" · ")} · Maximum 100MB per file</span></label>
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}{createdId && <> <Link className="font-bold underline" href={`/houses/${encodeURIComponent(createdId)}`}>Open your listing</Link></>}</p>}{message && <p role="status" className="text-sm text-emerald-800 sm:col-span-2">{message} {createdId && <Link className="font-bold underline" href={`/houses/${encodeURIComponent(createdId)}`}>View listing</Link>}</p>}
      <button disabled={busy} className="min-h-12 rounded-full bg-[#183b2c] px-6 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">{busy?t.busy:t.submit}</button>
    </form></div></main>;
}
