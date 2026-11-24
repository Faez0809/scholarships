/**
 * Short forms and other names people type for countries and regions, so that "KSA"
 * finds Saudi Arabia and "turkey" finds Türkiye. Matching is on the whole query, so
 * "us" means the United States and never matches "Australia". Two-letter codes that are
 * also department short forms (IT, CE, SE...) are left out on purpose.
 */
const ALIASES: Record<string, string[]> = {
  "saudi arabia": ["ksa", "saudi", "kingdom of saudi arabia"],
  "united kingdom": ["uk", "u k", "britain", "great britain", "gb", "england", "scotland", "wales", "united kingdom of great britain"],
  "united states": ["usa", "us", "u s", "u s a", "america", "united states of america", "states"],
  "united arab emirates": ["uae", "u a e", "emirates", "dubai", "abu dhabi"],
  qatar: ["doha"],
  "south korea": ["korea", "rok", "republic of korea", "kr"],
  japan: ["jp", "nihon", "nippon"],
  china: ["prc", "mainland china", "peoples republic of china"],
  "hong kong": ["hk", "hksar", "hong kong sar"],
  taiwan: ["roc", "republic of china"],
  singapore: ["sg", "sgp"],
  germany: ["deutschland"],
  netherlands: ["nl", "holland", "the netherlands", "dutch"],
  switzerland: ["swiss", "schweiz", "suisse"],
  turkiye: ["turkey"],
  sweden: ["swedish"],
  belgium: ["flanders", "flemish"],
  australia: ["aus", "aussie"],
  europe: ["eu", "european union"],
  "middle east": ["gulf", "gcc", "arab", "mena"],
  americas: ["north america"],
  oceania: ["anz"],
};

const LOOKUP = new Map<string, string>();
for (const [canonical, list] of Object.entries(ALIASES)) {
  for (const a of list) LOOKUP.set(a, canonical);
}

/** Lowercase, strip accents and punctuation, so "Türkiye" and "turkiye" compare equal. */
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The text to look for: the canonical place name when the query is a known short form. */
export function expandPlaceQuery(query: string): string {
  const q = foldText(query);
  return LOOKUP.get(q) ?? q;
}
