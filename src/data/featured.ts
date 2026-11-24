import { Scholarship } from "../types/scholarship";

/**
 * Well-known, fully funded programs shown as a small "Featured" set on the home page.
 * Three are picked per day, so returning visitors see variety.
 */
export const FEATURED_POOL = [
  "rhodes-oxford-2028",
  "gates-cambridge-2026",
  "knight-hennessy-stanford-2028",
  "chevening-uk-2028",
  "schwarzman-tsinghua-2028",
  "daad-epos-germany-2026",
  "kaust-fellowship-2026",
  "mext-japan-todai-2026",
  "erasmus-mundus-emjm-2026",
  "clarendon-oxford-2027",
  "eth-zurich-esop-2026",
  "hkpfs-hong-kong-2027",
  "mbzuai-uae-2027",
  "gks-graduate-korea-2027",
  "eiffel-excellence-2026",
  "commonwealth-uk-2028",
  "oist-phd-japan-2028",
  "epfl-excellence-2027",
];

/** Small deterministic shuffle so a given day always shows the same three. */
function seeded(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks `count` featured programs for the given day. Closed programs are skipped. When a
 * filter is given (for example "the visitor qualifies"), matching programs come first.
 */
export function pickFeatured(
  all: Scholarship[],
  day: number,
  count = 3,
  prefer?: (s: Scholarship) => boolean,
  isOpen: (s: Scholarship) => boolean = () => true
): Scholarship[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const pool = FEATURED_POOL.map((id) => byId.get(id)).filter((s): s is Scholarship => !!s && isOpen(s));
  const rand = seeded(day);
  const shuffled = pool
    .map((s) => ({ s, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.s);
  const preferred = prefer ? shuffled.filter(prefer) : [];
  const ordered = [...preferred, ...shuffled.filter((s) => !preferred.includes(s))];
  return ordered.slice(0, count);
}
