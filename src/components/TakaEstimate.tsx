"use client";

import React, { useEffect, useState } from "react";
import { formatVerifiedDate } from "../utils/scholarshipUtils";

interface Rate {
  rate: number;
  asOf: string;
}

const STORAGE_KEY = "scholar_track_fx_bdt";
let memo: Promise<Rate | null> | null = null;

/** Loads the USD→BDT rate once per page view, reusing today's value from the browser. */
function loadRate(): Promise<Rate | null> {
  if (memo) return memo;
  memo = (async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") as (Rate & { day: string }) | null;
      if (saved && saved.day === today && saved.rate > 0) return { rate: saved.rate, asOf: saved.asOf };
    } catch {
      // ignore storage problems
    }
    try {
      const res = await fetch("/api/fx");
      const data = (await res.json()) as { rate: number | null; asOf: string | null };
      if (!data.rate || !data.asOf) return null;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: data.rate, asOf: data.asOf, day: today }));
      } catch {
        // ignore storage problems
      }
      return { rate: data.rate, asOf: data.asOf };
    } catch {
      return null;
    }
  })();
  return memo;
}

const taka = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** "৳1,35,000" under a lakh-style grouping; yearly amounts of a lakh or more read "৳16.2 lakh". */
function formatYear(amount: number): string {
  if (amount >= 1_00_00_000) return `৳${(amount / 1_00_00_000).toFixed(2).replace(/\.?0+$/, "")} crore`;
  if (amount >= 1_00_000) return `৳${(amount / 1_00_000).toFixed(1).replace(/\.0$/, "")} lakh`;
  return `৳${taka.format(amount)}`;
}

/** Approximate stipend in Bangladeshi taka, per month and per year. */
export const TakaEstimate: React.FC<{ monthlyUSD: number }> = ({ monthlyUSD }) => {
  const [rate, setRate] = useState<Rate | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadRate().then((r) => {
      if (!cancelled) setRate(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!monthlyUSD || monthlyUSD <= 0 || rate === null) return null;
  if (rate === undefined) return <p className="mt-2 h-5 w-56 animate-pulse rounded bg-stone-100" aria-hidden="true" />;

  const month = Math.round((monthlyUSD * rate.rate) / 100) * 100;
  const year = month * 12;
  return (
    <p className="mt-2 text-sm text-stone-700">
      <span className="text-stone-500">In taka: </span>≈ ৳{taka.format(month)} a month · {formatYear(year)} a year
      <span className="block text-[11px] text-stone-400">
        Based on about ${monthlyUSD.toLocaleString("en-US")} a month at $1 = ৳{rate.rate.toFixed(2)}, rate as of {formatVerifiedDate(rate.asOf)}
      </span>
    </p>
  );
};
