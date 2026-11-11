"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../navbar";
import { useLanguage } from "../../language-context";
import { kenyaCounties } from "@/lib/kenya-counties";
import { houseTypes } from "@/lib/house-types";
import { uploadUserFile } from "@/lib/client-upload";
import { validateMediaFileMetadata } from "@/lib/listing-input.mjs";

type QueuedFile = { file: File; progress: number | null; state: "ready" | "uploading" | "processing" | "done" | "failed"; error?: string };
const amenities = ["24/7 security", "Reliable water", "Wi-Fi", "Secure parking", "CCTV", "Laundry area", "Prepaid electricity", "Nearby shops", "Public transport nearby"];
const inputClass = "min-h-11 w-full rounded-xl border border-[#dce5db] bg-white px-3 font-normal text-[#183b2c] outline-none focus:border-[#668773] focus:ring-2 focus:ring-[#183b2c]/10";

export default function CreateHouseClient() {
  const { language } = useLanguage();
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const previews = useMemo(() => files.map(({ file }) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function selectFiles(selected: File[]) {
    setError("");
    if (selected.length > 4) { setError("A listing can have a maximum of 4 media files."); return; }
    for (const file of selected) {
      const validation = validateMediaFileMetadata(file.name, file.type, file.size);
      if (!validation.valid) { setError(validation.reason ?? "This media file is not supported."); return; }
    }
    setFiles(selected.map((file) => ({ file, progress: null, state: "ready" })));
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }

  async function uploadQueue(houseId: string, startAt = 0) {
    for (let index = startAt; index < files.length; index += 1) {
      const entry = files[index];
      if (entry.state === "done") continue;
      setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, state: "uploading", progress: null, error: undefined } : item));
      try {
        const blob = await uploadUserFile(entry.file, { kind: "house-image", houseId }, (progress) => setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, progress: Math.max(0, Math.min(100, progress)) } : item)));
        setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, state: "processing", progress: 100 } : item));
        const registered = await fetch("/api/uploads/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "house-image", houseId, url: blob.url, pathname: blob.pathname, contentType: entry.file.type, size: entry.file.size }) });
        const result = await registered.json();
        if (!registered.ok) throw new Error(result.error || "The file could not be processed.");
        setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, state: "done" } : item));
      } catch (issue) {
        const reason = issue instanceof Error ? issue.message : "Upload failed.";
        setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, state: "failed", error: reason } : item));
        throw new Error(`${entry.file.name}: ${reason}`);
      }
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const customType = String(form.get("customType") || "").trim();
    const selectedType = String(form.get("type") || "");
    const selectedAmenities = form.getAll("amenities").map(String);
    const socials = String(form.get("socials") || "").split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
    const priceText = String(form.get("price") || "").trim();
    if (!/^\d{1,7}$/.test(priceText) || Number(priceText) < 500) { setError("Enter monthly rent of at least KSh 500."); return; }
    for (const field of ["deposit", "bills"]) { const value = String(form.get(field) || "").trim(); if (value && !/^\d{1,7}$/.test(value)) { setError(`${field === "deposit" ? "Deposit" : "Monthly bills"} must be a whole number or left blank.`); return; } }
    setBusy(true);
    try {
      const response = await fetch("/api/houses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.get("name"), location: form.get("location"), county: form.get("county"), type: selectedType, customType: selectedType === "Other" ? customType : "", furnishing: form.get("furnishing"), customFurnishing: form.get("customFurnishing"), rooms: form.get("rooms"), description: form.get("description"), phone: form.get("phone"), whatsapp: form.get("whatsapp"), whatsappUrl: form.get("whatsappUrl"), socials, price: priceText, deposit: form.get("deposit"), monthlyBills: form.get("bills"), available: form.get("available") || 1, distance: "", locationUrl: form.get("locationUrl"), amenities: [...selectedAmenities, ...String(form.get("customAmenities") || "").split(/[\n,]/).map((item) => item.trim()).filter(Boolean)],
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create listing.");
      setCreatedId(result.id);
      await uploadQueue(result.id);
      setMessage(`Listing created. It is pending verification. ${files.length ? `${files.length} media file(s) uploaded.` : ""}`);
      formElement.reset(); setFiles([]);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "Could not create listing."); }
    finally { setBusy(false); }
  }

  async function retryUploads() {
    if (!createdId) return;
    setBusy(true); setError("");
    try { const failedIndex = files.findIndex((entry) => entry.state === "failed" || entry.state === "ready"); await uploadQueue(createdId, Math.max(failedIndex, 0)); setMessage("All selected media is uploaded."); }
    catch (issue) { setError(issue instanceof Error ? issue.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#faf9f6] text-[#183b2c]"><Navbar /><div className="mx-auto max-w-3xl px-5 py-8 sm:px-8"><Link href="/houses" className="text-sm font-semibold text-[#587060]">← Back to houses</Link><h1 className="mt-6 text-3xl font-extrabold">{language === "Sheng" ? "List keja" : language === "Swahili" ? "Weka nyumba" : "List a house"}</h1><p className="mt-2 text-sm leading-6 text-[#63736a]">Share the details with students. New listings stay pending until an admin reviews them.</p><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Never ask students to pay before they have viewed the house. Listings are reviewed, but verification does not guarantee availability or a transaction.</div>
    <form onSubmit={submit} className="mt-6 grid gap-4 rounded-3xl border border-[#e5ebe3] bg-white p-5 sm:grid-cols-2 sm:p-7">
      <label className="grid gap-1.5 text-sm font-semibold">Listing name<input name="name" required minLength={3} maxLength={100} className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Area / town<input name="location" required minLength={2} maxLength={120} className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">County<select name="county" required defaultValue="" className={inputClass}><option value="">Choose county</option>{kenyaCounties.map((county)=><option key={county}>{county}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold">House type<select name="type" defaultValue={houseTypes[0]} className={inputClass}>{[...houseTypes, "Other"].map((type)=><option key={type}>{type}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold">Custom house type (when Other)<input name="customType" maxLength={60} className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Furnishing<select name="furnishing" defaultValue="" className={inputClass}><option value="">Choose or leave blank</option>{["Furnished","Semi-Furnished","Unfurnished","Other"].map((value)=><option key={value}>{value}</option>)}</select><input name="customFurnishing" maxLength={60} placeholder="Custom furnishing description (optional)" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Rooms / layout<input name="rooms" required maxLength={60} placeholder="e.g. 1 bedroom, ensuite" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Monthly rent (KSh)<input name="price" required type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="8000" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Deposit (KSh, optional)<input name="deposit" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="Leave blank if none" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Estimated monthly bills (optional)<input name="bills" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" placeholder="Leave blank if unknown" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Units available<input name="available" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" defaultValue="1" className={inputClass} /></label>
      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Location link (optional)<input name="locationUrl" type="url" placeholder="Paste a Google Maps or supported map link" className={inputClass} /><span className="text-xs font-normal text-[#718077]">You can leave this blank; existing listings keep their saved map coordinates.</span></label>
      <fieldset className="grid gap-2 text-sm sm:col-span-2"><legend className="font-semibold">Amenities</legend><div className="grid gap-2 sm:grid-cols-3">{amenities.map((item)=><label key={item} className="flex items-center gap-2 font-normal"><input type="checkbox" name="amenities" value={item} className="accent-[#183b2c]" />{item}</label>)}</div><input name="customAmenities" placeholder="Add custom amenity (comma or new line separated)" className={inputClass} /></fieldset>
      <section className="grid gap-3 border-t border-[#edf0eb] pt-4 sm:col-span-2"><h2 className="font-bold">Contact Details</h2><p className="text-xs text-[#718077]">Only methods you fill in will appear on your listing card.</p><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold">Phone<input name="phone" type="tel" placeholder="+254 7xx xxx xxx" className={inputClass} /></label><label className="grid gap-1.5 text-sm font-semibold">WhatsApp number<input name="whatsapp" type="tel" placeholder="+254 7xx xxx xxx" className={inputClass} /></label><label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Or WhatsApp link<input name="whatsappUrl" type="url" placeholder="https://wa.me/..." className={inputClass} /></label><label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Social profile links<input name="socials" placeholder="Instagram, Facebook, Telegram, TikTok, X or other HTTPS URLs" className={inputClass} /><span className="text-xs font-normal text-[#718077]">Separate multiple links with commas.</span></label></div></section>
      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Description<textarea name="description" required minLength={20} maxLength={2000} rows={5} className="rounded-xl border border-[#dce5db] p-3 font-normal" /></label>
      <section className="grid gap-3 sm:col-span-2"><label className="grid gap-1.5 text-sm font-semibold">Photos or videos (up to 4 total)<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" onChange={(event)=>selectFiles(Array.from(event.target.files??[]))} className={inputClass} /><span className="text-xs font-normal text-[#718077]">JPG, PNG, WebP, AVIF, GIF, MP4 or WebM · maximum 100MB per file</span></label>
        {files.map(({file,state,progress,error: fileError}, index)=><div key={`${file.name}-${file.lastModified}`} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 rounded-xl border border-[#e5ebe3] p-2.5"><div className="relative h-16 w-20 overflow-hidden rounded-lg bg-[#f1f4ef]">{file.type.startsWith("video/")?<video src={previews[index]} muted playsInline preload="metadata" className="h-full w-full object-cover" />:<Image src={previews[index]} alt={`Preview ${file.name}`} fill unoptimized className="object-cover" />}<span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 text-[9px] font-bold text-white">{file.type.startsWith("video/")?"VIDEO":"IMAGE"}</span></div><div className="min-w-0"><p className="truncate text-xs font-semibold">{file.name}</p><p className="mt-1 text-[11px] text-[#718077]">{state === "uploading" ? progress === null ? "Uploading…" : `Uploading ${Math.round(progress)}%` : state === "processing" ? "Processing…" : state === "done" ? "Uploaded" : state === "failed" ? `Failed · ${fileError}` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}</p>{state === "uploading" && progress !== null && <progress max="100" value={progress} className="mt-1 h-1.5 w-full accent-[#183b2c]" />}</div><div className="flex items-center gap-1"><button type="button" disabled={busy || index===0} onClick={()=>moveFile(index,-1)} aria-label="Move media earlier" className="min-h-9 min-w-9 rounded-full border disabled:opacity-40">↑</button><button type="button" disabled={busy || index===files.length-1} onClick={()=>moveFile(index,1)} aria-label="Move media later" className="min-h-9 min-w-9 rounded-full border disabled:opacity-40">↓</button><button type="button" disabled={busy} onClick={()=>setFiles((current)=>current.filter((_,i)=>i!==index))} aria-label={`Remove ${file.name}`} className="min-h-9 min-w-9 rounded-full border text-red-700 disabled:opacity-40">×</button></div></div>)}
      </section>
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}{createdId && <> <Link className="font-bold underline" href={`/houses/${encodeURIComponent(createdId)}`}>Open your listing</Link> <button type="button" onClick={()=>void retryUploads()} className="ml-2 font-bold underline">Retry failed uploads</button></>}</p>}{message && <p role="status" className="text-sm text-emerald-800 sm:col-span-2">{message} {createdId && <Link className="font-bold underline" href={`/houses/${encodeURIComponent(createdId)}`}>View listing</Link>}</p>}
      <button disabled={busy} className="min-h-12 rounded-full bg-[#183b2c] px-6 text-sm font-bold text-white transition hover:bg-[#285640] disabled:opacity-50 sm:col-span-2">{busy?"Creating and uploading…":"Create listing"}</button>
    </form></div></main>;
}
