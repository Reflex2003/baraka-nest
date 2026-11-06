"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type User = { id: string; name: string; email: string; createdAt: string; roommate_profile_id: string | null };
type Report = { id: string; category: string; details: string; status: string; created_at: string; reported_name: string; reporter_name: string };
type House = { id: string; name: string; location: string; county: string; price: number; type: string; rooms: string; available: number; description: string; amenities: string[]; distance: string; coordinates: { lat: number; lon: number }; hidden: boolean; featured: boolean };
type AdminData = { users: User[]; reports: Report[]; openReports: number; roommateProfiles: number; houses: House[]; loadedAt: string };
type HouseForm = Omit<House, "id" | "hidden" | "featured"> & { id?: string };
const emptyHouseForm: HouseForm = { name: "", location: "", county: "", price: 8000, type: "Bedsitter", rooms: "1 room", available: 1, description: "", amenities: [], distance: "", coordinates: { lat: -1.2864, lon: 36.8172 } };

const panel = "rounded-3xl border border-[#e5ebe3] bg-white p-5 shadow-[0_10px_30px_rgba(24,59,44,0.04)] sm:p-6";
const button = "min-h-10 rounded-full border border-[#dce5db] px-4 text-xs font-bold text-[#355342] transition hover:bg-[#f3f6f1] disabled:opacity-50";

export default function AdminClient() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [houseForm, setHouseForm] = useState<HouseForm>(emptyHouseForm);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin", { cache: "no-store", credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load platform controls.");
      setData(result as AdminData);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not load platform controls.");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- The panel synchronizes with protected server data on entry.
  useEffect(() => { void refresh(); }, [refresh]);

  async function update(payload: Record<string, unknown>, label: string, method = "PATCH") {
    setBusy(label);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "That update could not be saved.");
      setNotice("Platform update saved.");
      if (payload.action === "house-update" || method === "POST") setHouseForm(emptyHouseForm);
      await refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "That update could not be saved.");
    } finally {
      setBusy("");
    }
  }

  function editHouse(house: House) {
    setHouseForm({
      id: house.id,
      name: house.name,
      location: house.location,
      county: house.county,
      price: house.price,
      type: house.type,
      rooms: house.rooms,
      available: house.available,
      description: house.description,
      amenities: house.amenities,
      distance: house.distance,
      coordinates: house.coordinates,
    });
    document.getElementById("house-editor")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function submitHouse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const editing = Boolean(houseForm.id);
    void update({
      ...(editing ? { action: "house-update", id: houseForm.id } : {}),
      name: houseForm.name,
      location: houseForm.location,
      county: houseForm.county,
      price: Number(houseForm.price),
      type: houseForm.type,
      rooms: houseForm.rooms,
      available: Number(houseForm.available),
      description: houseForm.description,
      amenities: houseForm.amenities,
      distance: houseForm.distance,
      lat: Number(houseForm.coordinates.lat),
      lon: Number(houseForm.coordinates.lon),
    }, editing ? houseForm.id! : "new-house", editing ? "PATCH" : "POST");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-7 text-[#183b2c] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e58b45]">Private platform controls</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Baraka Nest admin</h1>
            <p className="mt-2 text-sm text-[#718077]">Manage reports, listings and roommate visibility.</p>
          </div>
          <div className="flex gap-2">
            <button className={button} onClick={() => void refresh()}>Refresh</button>
            <Link href="/dashboard" className={`${button} inline-flex items-center`}>Student dashboard</Link>
          </div>
        </header>

        {error && <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error} <button className="ml-2 font-bold underline" onClick={() => void refresh()}>Retry</button></div>}
        {notice && <p role="status" className="mb-5 rounded-2xl bg-[#eaf2e8] px-4 py-3 text-sm font-semibold text-[#285640]">{notice}</p>}
        {!data && !error && <div className={`${panel} animate-pulse text-sm text-[#718077]`}>Loading platform controls…</div>}
        {data && <>
          <section className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Platform overview">
            {[["Student accounts", data.users.length], ["Roommate profiles", data.roommateProfiles], ["Open reports", data.openReports]] .map(([label, value]) => <article key={label} className={panel}><p className="text-sm font-semibold text-[#718077]">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></article>)}
          </section>

          <section id="house-editor" className={`${panel} mb-6`}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-xl font-extrabold">{houseForm.id ? "Edit a housing listing" : "Add a housing listing"}</h2><p className="mt-1 text-sm text-[#718077]">Listings are saved in Turso and appear in housing search. Enter a map point in Kenya.</p></div>
              {houseForm.id && <button type="button" className={button} onClick={() => setHouseForm(emptyHouseForm)}>Cancel edit</button>}
            </div>
            <form onSubmit={submitHouse} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-bold text-[#526258]">House name<input required minLength={3} maxLength={100} value={houseForm.name} onChange={(event) => setHouseForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Area<input required maxLength={120} value={houseForm.location} onChange={(event) => setHouseForm((current) => ({ ...current, location: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">County<input required maxLength={80} value={houseForm.county} onChange={(event) => setHouseForm((current) => ({ ...current, county: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Monthly rent (KSh)<input required type="number" min={500} max={1000000} value={houseForm.price} onChange={(event) => setHouseForm((current) => ({ ...current, price: Number(event.target.value) }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Home type<input required maxLength={60} value={houseForm.type} onChange={(event) => setHouseForm((current) => ({ ...current, type: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Room description<input required maxLength={60} value={houseForm.rooms} onChange={(event) => setHouseForm((current) => ({ ...current, rooms: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Available spaces<input required type="number" min={0} max={1000} value={houseForm.available} onChange={(event) => setHouseForm((current) => ({ ...current, available: Number(event.target.value) }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258]">Distance from campus (optional)<input maxLength={100} value={houseForm.distance} onChange={(event) => setHouseForm((current) => ({ ...current, distance: event.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <div className="grid grid-cols-2 gap-2"><label className="text-xs font-bold text-[#526258]">Latitude<input required type="number" min={-5} max={6} step="any" value={houseForm.coordinates.lat} onChange={(event) => setHouseForm((current) => ({ ...current, coordinates: { ...current.coordinates, lat: Number(event.target.value) } }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label><label className="text-xs font-bold text-[#526258]">Longitude<input required type="number" min={33} max={42} step="any" value={houseForm.coordinates.lon} onChange={(event) => setHouseForm((current) => ({ ...current, coordinates: { ...current.coordinates, lon: Number(event.target.value) } }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label></div>
              <label className="text-xs font-bold text-[#526258] sm:col-span-2">Description<textarea required minLength={20} maxLength={2000} rows={3} value={houseForm.description} onChange={(event) => setHouseForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#dfe6dd] px-3 py-2 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#526258] sm:col-span-2 lg:col-span-1">Amenities, separated by commas<input value={houseForm.amenities.join(", ")} onChange={(event) => setHouseForm((current) => ({ ...current, amenities: event.target.value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20) }))} className="mt-1 min-h-11 w-full rounded-xl border border-[#dfe6dd] px-3 text-sm font-normal" /></label>
              <div className="flex items-end"><button disabled={Boolean(busy)} className="min-h-11 w-full rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : houseForm.id ? "Save changes" : "Publish listing"}</button></div>
            </form>
          </section>

          <section className={`${panel} mb-6`}>
            <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">Housing listings</h2><p className="mt-1 text-sm text-[#718077]">Hide a listing or feature it in discovery.</p></div><span className="text-xs text-[#87938b]">{data.houses.length} listings</span></div>
            <div className="divide-y divide-[#edf0eb]">
              {data.houses.map((house) => <div key={house.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div><p className="font-bold">{house.name}</p><p className="mt-1 text-xs text-[#718077]">{house.location}</p></div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={Boolean(busy)} className={button} onClick={() => editHouse(house)}>Edit details</button>
                  <button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "house-control", id: house.id, hidden: !house.hidden, featured: house.featured }, house.id)}>{house.hidden ? "Show listing" : "Hide listing"}</button>
                  <button disabled={Boolean(busy)} className={`${button} ${house.featured ? "border-[#e9b581] bg-[#fff7ed] text-[#98511f]" : ""}`} onClick={() => void update({ action: "house-control", id: house.id, hidden: house.hidden, featured: !house.featured }, house.id)}>{house.featured ? "★ Featured" : "Feature listing"}</button>
                  <button disabled={Boolean(busy)} className={`${button} text-red-700`} onClick={() => { if (window.confirm(`Remove ${house.name} and its saved-home records?`)) void update({ action: "house-delete", id: house.id }, house.id); }}>Delete</button>
                </div>
              </div>)}
            </div>
          </section>

          <section className={`${panel} mb-6`}>
            <div className="mb-4"><h2 className="text-xl font-extrabold">Safety reports</h2><p className="mt-1 text-sm text-[#718077]">Review concerns submitted by students and record the outcome.</p></div>
            {data.reports.length === 0 ? <p className="rounded-2xl bg-[#f7f8f4] px-4 py-6 text-sm text-[#718077]">No reports have been submitted.</p> : <div className="space-y-3">{data.reports.map((report) => <article key={report.id} className="rounded-2xl border border-[#edf0eb] p-4">
              <div className="flex flex-wrap justify-between gap-2"><div><p className="font-bold">{report.category.replaceAll("_", " ")} <span className="ml-2 rounded-full bg-[#f1f4ef] px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#718077]">{report.status}</span></p><p className="mt-1 text-xs text-[#718077]">{report.reporter_name} reported {report.reported_name} · {new Date(report.created_at).toLocaleDateString()}</p></div>
              {report.status === "open" && <div className="flex gap-2"><button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "report-status", id: report.id, status: "resolved" }, report.id)}>Resolve</button><button disabled={Boolean(busy)} className={button} onClick={() => void update({ action: "report-status", id: report.id, status: "dismissed" }, report.id)}>Dismiss</button></div>}</div>
              {report.details && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526258]">{report.details}</p>}
            </article>)}</div>}
          </section>

          <section className={panel}>
            <div className="mb-4"><h2 className="text-xl font-extrabold">Student accounts</h2><p className="mt-1 text-sm text-[#718077]">Review recent accounts and remove roommate listings that violate platform rules.</p></div>
            {data.users.length === 0 ? <p className="text-sm text-[#718077]">No student accounts found.</p> : <div className="divide-y divide-[#edf0eb]">{data.users.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
              <div><p className="font-bold">{user.name || "Student"}</p><p className="mt-1 text-xs text-[#718077]">{user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}</p></div>
              {user.roommate_profile_id ? <button disabled={Boolean(busy)} className={`${button} text-red-700`} onClick={() => { if (window.confirm("Remove this student's roommate profile? This cannot be undone.")) void update({ action: "remove-roommate-profile", id: user.roommate_profile_id }, user.id); }}>Remove roommate profile</button> : <span className="rounded-full bg-[#f4f6f2] px-3 py-1.5 text-xs text-[#718077]">No roommate profile</span>}
            </div>)}</div>}
            <p className="mt-5 text-[11px] leading-5 text-[#87938b]">Showing up to 250 newest accounts and reports. Account authentication remains controlled by Better Auth.</p>
          </section>
        </>}
        {data && <p className="mt-5 text-right text-[11px] text-[#87938b]">Last loaded {new Date(data.loadedAt).toLocaleString()}</p>}
      </div>
    </main>
  );
}
