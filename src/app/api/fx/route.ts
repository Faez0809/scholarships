export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

/**
 * GET /api/fx
 * US dollar to Bangladeshi taka, from the free open.er-api.com feed (no key).
 * Cached for a day on the server; returns { rate: null } if the feed is unavailable.
 */
let cached: { rate: number; asOf: string; fetchedAt: number } | null = null;
const DAY = 24 * 60 * 60 * 1000;

export async function GET() {
  if (cached && Date.now() - cached.fetchedAt < DAY) {
    return NextResponse.json({ rate: cached.rate, asOf: cached.asOf });
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    const rate = data.rates?.BDT;
    if (data.result !== "success" || typeof rate !== "number" || rate <= 0) throw new Error("no BDT rate");
    const asOf = data.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    cached = { rate, asOf, fetchedAt: Date.now() };
    return NextResponse.json({ rate, asOf });
  } catch (err) {
    console.warn("Exchange rate unavailable:", err instanceof Error ? err.message : err);
    if (cached) return NextResponse.json({ rate: cached.rate, asOf: cached.asOf });
    return NextResponse.json({ rate: null, asOf: null });
  }
}
