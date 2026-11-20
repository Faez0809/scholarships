/* eslint-disable @next/next/no-img-element -- remote Wikimedia images with their own sizes */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X, ImageOff } from "lucide-react";
import { getUniversityInfo, UniversityInfo, UniversityPhoto } from "../lib/wiki";
import { useDialog } from "./ui";

/**
 * Short intro and real campus photos for a university, loaded from Wikipedia.
 * Photos that fail to load are dropped from the strip and the viewer, so a broken
 * image never shows.
 */
export const UniversityGallery: React.FC<{ name: string; compact?: boolean }> = ({ name, compact }) => {
  const [info, setInfo] = useState<UniversityInfo | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "none">("idle");
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());

  const [shownFor, setShownFor] = useState(name);
  if (shownFor !== name) {
    setShownFor(name);
    setInfo(null);
    setState("idle");
    setOpenUrl(null);
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

  const markFailed = useCallback((url: string) => {
    setFailed((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  }, []);

  const photos = useMemo(
    () => (info?.photos || []).filter((p) => !failed.has(p.thumbUrl) && !failed.has(p.largeUrl)),
    [info, failed]
  );
  const openIndex = openUrl ? photos.findIndex((p) => p.largeUrl === openUrl) : -1;

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
          {photos.length > 0 ? (
            <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" aria-label={`Photos of ${info.title}`}>
              {photos.map((p) => (
                <li key={p.largeUrl} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenUrl(p.largeUrl)}
                    className={`block overflow-hidden rounded-lg bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                      compact ? "h-20 w-28" : "h-28 w-40 sm:h-32 sm:w-48"
                    }`}
                    aria-label={`View photo: ${p.title}`}
                  >
                    <FadeImg
                      src={p.thumbUrl}
                      alt={p.title}
                      lazy
                      onFail={() => markFailed(p.thumbUrl)}
                      className="h-full w-full object-cover transition hover:opacity-90"
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

      {openIndex >= 0 && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onChange={(i) => setOpenUrl(photos[i].largeUrl)}
          onFail={(url) => {
            // Move on to the next photo before dropping the broken one.
            const remaining = photos.filter((p) => p.largeUrl !== url);
            setOpenUrl(remaining.length ? remaining[Math.min(openIndex, remaining.length - 1)].largeUrl : null);
            markFailed(url);
          }}
          onClose={() => setOpenUrl(null)}
        />
      )}
    </div>
  );
};

/** Image that fades in once loaded and reports a failed load. */
const FadeImg: React.FC<{ src: string; alt: string; className?: string; lazy?: boolean; onFail: () => void; onLoad?: () => void }> = ({
  src,
  alt,
  className,
  lazy,
  onFail,
  onLoad,
}) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => {
        setLoadedSrc(src);
        onLoad?.();
      }}
      onError={onFail}
      className={`${className || ""} duration-300 ${loadedSrc === src ? "opacity-100" : "opacity-0"}`}
    />
  );
};

const Lightbox: React.FC<{
  photos: UniversityPhoto[];
  index: number;
  onChange: (i: number) => void;
  onFail: (url: string) => void;
  onClose: () => void;
}> = ({ photos, index, onChange, onFail, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(true, ref);
  const p = photos[index];
  const many = photos.length > 1;
  const prev = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, photos.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, photos.length, onChange]);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && many) prev();
      if (e.key === "ArrowRight" && many) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, many]);

  // Warm the cache for the neighbours so moving between photos feels instant.
  useEffect(() => {
    if (!many) return;
    [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]].forEach((n) => {
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = n.largeUrl;
    });
  }, [index, photos, many]);

  // Keep the page behind from scrolling.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const loading = loadedUrl !== p.largeUrl;

  return (
    <div ref={ref} className="fixed inset-0 z-[60] flex flex-col bg-stone-950 text-white" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="flex items-center justify-between px-3 py-2 text-sm text-white/70">
        <span className="tabular-nums">{many ? `${index + 1} / ${photos.length}` : ""}</span>
        <button type="button" onClick={onClose} className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Close photo viewer">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2"
        onClick={onClose}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        }}
      >
        {loading && (
          <span
            className="absolute h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70"
            role="status"
            aria-label="Loading photo"
          />
        )}
        <img
          key={p.largeUrl}
          src={p.largeUrl}
          alt={p.title}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedUrl(p.largeUrl)}
          onError={() => onFail(p.largeUrl)}
          className={`max-h-full max-w-full select-none object-contain transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
        {many && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block"
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
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:block"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="px-4 pb-4 pt-2 text-center text-xs text-white/60">
        {many && (
          <div className="mb-2 flex items-center justify-center gap-6 sm:hidden">
            <button type="button" onClick={prev} className="rounded-full bg-white/10 p-2.5 text-white" aria-label="Previous photo">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} className="rounded-full bg-white/10 p-2.5 text-white" aria-label="Next photo">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        <p className="line-clamp-2">
          {p.title} · {p.author} ·{" "}
          <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            {p.license}
          </a>
        </p>
      </div>
    </div>
  );
};
