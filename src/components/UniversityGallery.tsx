/* eslint-disable @next/next/no-img-element -- remote Wikimedia images with their own sizes */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X, ImageOff } from "lucide-react";
import { getUniversityInfo, UniversityInfo } from "../lib/wiki";
import { useDialog } from "./ui";

/**
 * Short intro and real campus photos for a university, loaded lazily from Wikipedia.
 * Shows nothing extra when no freely licensed photos exist.
 */
export const UniversityGallery: React.FC<{ name: string; compact?: boolean }> = ({ name, compact }) => {
  const [info, setInfo] = useState<UniversityInfo | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "none">("idle");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const [shownFor, setShownFor] = useState(name);
  if (shownFor !== name) {
    setShownFor(name);
    setInfo(null);
    setState("idle");
  }

  // Load once per university name. The result is cached in lib/wiki.
  useEffect(() => {
    let cancelled = false;
    getUniversityInfo(name).then((data) => {
      if (cancelled) return;
      setInfo(data);
      setState(data ? "done" : "none");
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div>
      {state === "loading" || state === "idle" ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3 w-5/6 animate-pulse rounded bg-stone-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200" />
          <div className="flex gap-2 overflow-hidden pt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 w-28 shrink-0 animate-pulse rounded-lg bg-stone-200" />
            ))}
          </div>
        </div>
      ) : state === "none" || !info ? (
        <p className="flex items-center gap-1.5 text-sm text-stone-500">
          <ImageOff className="h-4 w-4" /> No public information found for {name}.
        </p>
      ) : (
        <div>
          {info.extract && (
            <p className={`text-sm leading-relaxed text-stone-700 ${compact ? "line-clamp-3" : "line-clamp-5"}`}>{info.extract}</p>
          )}
          {info.photos.length > 0 ? (
            <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" aria-label={`Photos of ${info.title}`}>
              {info.photos.map((p, i) => (
                <li key={p.fullUrl} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                    aria-label={`View photo: ${p.title}`}
                  >
                    <img
                      src={p.thumbUrl}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className={`${compact ? "h-20 w-28" : "h-28 w-40 sm:h-32 sm:w-48"} object-cover transition hover:opacity-90`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-stone-500">No freely licensed campus photos are available.</p>
          )}
          <a href={info.pageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800">
            From Wikipedia <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {lightbox !== null && info && (
        <Lightbox photos={info.photos} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
};

const Lightbox: React.FC<{
  photos: UniversityInfo["photos"];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}> = ({ photos, index, onChange, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(true, ref);
  const p = photos[index];
  const prev = () => onChange((index - 1 + photos.length) % photos.length);
  const next = () => onChange((index + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={ref} className="fixed inset-0 z-[60] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="flex items-center justify-between px-3 py-2 text-sm text-white/80">
        <span className="tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Close photo viewer">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-2" onClick={onClose}>
        <img
          src={p.width > 1600 ? p.thumbUrl.replace(/\/\d+px-/, "/1600px-") : p.fullUrl}
          alt={p.title}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <p className="px-4 pb-4 pt-2 text-center text-xs text-white/70">
        {p.title} · {p.author} ·{" "}
        <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
          {p.license}
        </a>
      </p>
    </div>
  );
};
