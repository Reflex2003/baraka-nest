"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HouseMedia } from "@/lib/houses";
import type { Language } from "@/app/language-context";

/* eslint-disable @next/next/no-img-element -- Blob media is loaded directly so the viewer only fetches the active full-size file. */

const copy = {
  English: { open: "Open listing photos", pause: "Paused", close: "Close gallery", viewPhoto: "View photo", items: "photos & videos" },
  Swahili: { open: "Fungua picha za nyumba", pause: "Imesitishwa", close: "Funga picha", viewPhoto: "Angalia picha", items: "picha na video" },
  Sheng: { open: "Fungua picha za hii keja", pause: "Imepause", close: "Funga picha", viewPhoto: "Check picha", items: "pics na videos" },
};

export default function HouseMediaGallery({ media, name, language }: { media: HouseMedia[]; name: string; language: Language }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startRef = useRef(0);
  const progressRef = useRef(0);
  const t = copy[language];
  const current = media[index];
  const isVideo = current?.contentType.startsWith("video/");

  const move = useCallback((direction: number) => {
    setIndex((value) => (value + direction + media.length) % media.length);
    setProgress(0);
    progressRef.current = 0;
    setPaused(false);
  }, [media.length]);

  useEffect(() => {
    if (!open || paused || !current || isVideo || media.length <= 1) return;
    startRef.current = Date.now() - progressRef.current * 5000;
    const timer = window.setInterval(() => {
      const next = Math.min(1, (Date.now() - startRef.current) / 5000);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) move(1);
    }, 50);
    return () => window.clearInterval(timer);
  }, [open, paused, current, isVideo, move, index, media.length]);

  useEffect(() => {
    if (open && isVideo && videoRef.current) {
      if (paused) videoRef.current.pause();
      else void videoRef.current.play().catch(() => setPaused(true));
    }
  }, [open, isVideo, paused, index]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, move]);

  if (!media.length) return null;
  const beginHold = () => {
    if (isVideo) setPaused(true);
    else {
      progressRef.current = progress;
      setPaused(true);
    }
  };
  const endHold = () => setPaused(false);

  return <>
    <button type="button" onClick={() => { setIndex(0); setProgress(0); progressRef.current = 0; setOpen(true); }} className="relative mt-6 block w-full overflow-hidden rounded-[28px] bg-[#141a16] text-left" aria-label={t.open}>
      {media[0].contentType.startsWith("video/") ? <video src={media[0].url} muted playsInline preload="metadata" className="h-64 w-full object-contain sm:h-[420px]" /> : <img src={media[0].url} alt={name} loading="lazy" className="h-64 w-full object-contain sm:h-[420px]" />}
      <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">{media.length > 1 ? `${media.length} ${t.items}` : t.viewPhoto}</span>
    </button>
    {open && current && <div className="fixed inset-0 z-[100] flex select-none flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label={`${name} media gallery`} onContextMenu={(event) => event.preventDefault()}>
      <div className="absolute inset-x-0 top-0 z-20 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {media.length > 1 && <div className="mb-4 flex gap-1">{media.map((item, itemIndex) => <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35"><div className="h-full bg-white" style={{ width: itemIndex < index ? "100%" : itemIndex === index ? `${progress * 100}%` : "0%" }} /></div>)}</div>}
        <div className="flex items-center justify-between"><p className="text-sm font-semibold drop-shadow">{media.length > 1 ? `${index + 1} / ${media.length}` : name}</p><button type="button" onClick={() => setOpen(false)} className="rounded-full bg-black/50 px-3 py-2 text-sm" aria-label={t.close}>✕</button></div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden" onPointerDown={beginHold} onPointerUp={endHold} onPointerCancel={endHold} onPointerLeave={endHold} style={{ touchAction: "pan-y" }}>
        {isVideo ? <video key={current.id} ref={videoRef} src={current.url} muted playsInline autoPlay preload="metadata" onTimeUpdate={(event) => { const video = event.currentTarget; if (video.duration) setProgress(video.currentTime / video.duration); }} onEnded={() => media.length > 1 ? move(1) : setPaused(true)} className="max-h-full max-w-full object-contain" /> : <img key={current.id} src={current.url} alt={`${name} ${index + 1}`} draggable={false} className="max-h-full max-w-full object-contain" />}
        {paused && <span className="pointer-events-none absolute rounded-full bg-black/60 px-4 py-2 text-sm">{t.pause}</span>}
        {media.length > 1 && <><button type="button" aria-label="Previous media" onClick={() => move(-1)} className="absolute inset-y-0 left-0 w-[38%] cursor-w-resize bg-transparent" /><button type="button" aria-label="Next media" onClick={() => move(1)} className="absolute inset-y-0 right-0 w-[62%] cursor-e-resize bg-transparent" /></>}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>}
  </>;
}
