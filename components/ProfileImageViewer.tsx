"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

type ProfileImageViewerProps = {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  imageClassName?: string;
};

export default function ProfileImageViewer({
  src,
  alt,
  children,
  className = "",
  imageClassName = "",
}: ProfileImageViewerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`View full-size image: ${alt}`}
        title="View full size"
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${className}`}
      >
        {children}
      </button>
      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            aria-label="Close full-size image"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ×
          </button>
          <Image
            src={src}
            alt={alt}
            width={1800}
            height={1800}
            unoptimized
            onClick={(event) => event.stopPropagation()}
            className={`max-h-[90vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl ${imageClassName}`}
          />
        </div>
      )}
    </>
  );
}
