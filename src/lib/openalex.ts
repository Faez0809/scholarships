/**
 * Minimal client for the public OpenAlex API (https://openalex.org).
 * No key is required. Requests are made from the browser, so each visitor
 * uses their own share of the free daily allowance.
 */

const BASE = "https://api.openalex.org";

export interface InstitutionOption {
  id: string; // short id, e.g. "I151746483"
  name: string;
  countryCode: string | null;
  city: string | null;
}

export interface MatchedWork {
  id: string;
  title: string;
  year: number | null;
  url: string;
  citedBy: number;
}

export interface SupervisorCandidate {
  id: string; // short id, e.g. "A5023888391"
  name: string;
  institution: string;
  institutionCountry: string | null;
  orcid: string | null;
  hIndex: number | null;
  worksCount: number;
  citedByCount: number;
  topics: string[];
  matchedWorks: MatchedWork[];
  matchCount: number;
  /** False when the author's latest known affiliation is somewhere else. */
  isCurrentlyThere: boolean;
  openAlexUrl: string;
  googleScholarUrl: string;
}

export interface SupervisorSearchResult {
  institution: InstitutionOption;
  candidates: SupervisorCandidate[];
  totalMatchingWorks: number;
}

function shortId(url: string | null | undefined): string {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1];
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (res.status === 429) {
    throw new Error("The research database is busy right now. Please wait a minute and try again.");
  }
  if (!res.ok) {
    throw new Error("Could not reach the research database. Please try again.");
  }
  return (await res.json()) as T;
}

interface RawInstitution {
  id: string;
  display_name: string;
  country_code: string | null;
  geo?: { city?: string | null } | null;
}

export async function searchInstitutions(
  query: string,
  signal?: AbortSignal
): Promise<InstitutionOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = await getJson<{ results: RawInstitution[] }>(
    `/institutions?search=${encodeURIComponent(q)}&per-page=6&select=id,display_name,country_code,geo`,
    signal
  );
  return (data.results || []).map((r) => ({
    id: shortId(r.id),
    name: r.display_name,
    countryCode: r.country_code,
    city: r.geo?.city ?? null,
  }));
}

interface RawAuthorship {
  author: { id: string | null; display_name: string };
  institutions: { id: string }[];
}

interface RawWork {
  id: string;
  title: string | null;
  display_name?: string | null;
  publication_year: number | null;
  cited_by_count: number;
  doi: string | null;
  authorships: RawAuthorship[];
}

interface RawAuthor {
  id: string;
  display_name: string;
  orcid: string | null;
  works_count: number;
  cited_by_count: number;
  summary_stats?: { h_index?: number } | null;
  last_known_institutions?: { id: string; display_name: string; country_code: string | null }[] | null;
  topics?: { display_name: string }[] | null;
}

export interface SupervisorSearchOptions {
  institution: InstitutionOption;
  topic: string;
  sinceYears: number;
  minWorks: number;
  signal?: AbortSignal;
}

/**
 * Finds researchers at an institution who recently published on a topic.
 * 1. Pull recent works from that institution matching the topic.
 * 2. Count matching papers per author affiliated with the institution.
 * 3. Load author profiles (h-index, totals, topics) for the top matches.
 */
export async function findSupervisors({
  institution,
  topic,
  sinceYears,
  minWorks,
  signal,
}: SupervisorSearchOptions): Promise<SupervisorSearchResult> {
  const fromYear = new Date().getFullYear() - sinceYears;
  const filters = [
    `authorships.institutions.id:${institution.id}`,
    `from_publication_date:${fromYear}-01-01`,
  ];
  const cleanTopic = topic.trim().replace(/[,:|]/g, " ");
  if (cleanTopic) filters.push(`title_and_abstract.search:${cleanTopic}`);

  const works = await getJson<{ meta: { count: number }; results: RawWork[] }>(
    `/works?filter=${encodeURIComponent(filters.join(","))}&per-page=100&sort=publication_date:desc&select=id,title,display_name,publication_year,cited_by_count,doi,authorships`,
    signal
  );

  const tally = new Map<string, { name: string; works: MatchedWork[] }>();
  for (const w of works.results || []) {
    const work: MatchedWork = {
      id: shortId(w.id),
      title: w.title || w.display_name || "Untitled",
      year: w.publication_year,
      url: w.doi || w.id,
      citedBy: w.cited_by_count || 0,
    };
    for (const a of w.authorships || []) {
      const authorId = shortId(a.author?.id);
      if (!authorId) continue;
      const atInstitution = (a.institutions || []).some((i) => shortId(i.id) === institution.id);
      if (!atInstitution) continue;
      const entry = tally.get(authorId) || { name: a.author.display_name, works: [] };
      if (!entry.works.some((x) => x.id === work.id)) entry.works.push(work);
      tally.set(authorId, entry);
    }
  }

  const ranked = Array.from(tally.entries())
    .sort((a, b) => b[1].works.length - a[1].works.length)
    .slice(0, 25);

  if (ranked.length === 0) {
    return { institution, candidates: [], totalMatchingWorks: works.meta?.count || 0 };
  }

  const authors = await getJson<{ results: RawAuthor[] }>(
    `/authors?filter=openalex:${ranked.map(([id]) => id).join("|")}&per-page=25&select=id,display_name,orcid,works_count,cited_by_count,summary_stats,last_known_institutions,topics`,
    signal
  );
  const byId = new Map((authors.results || []).map((a) => [shortId(a.id), a]));

  const candidates: SupervisorCandidate[] = ranked
    .map(([id, entry]) => {
      const a = byId.get(id);
      const lastKnown = a?.last_known_institutions || [];
      const isCurrentlyThere =
        lastKnown.length === 0 || lastKnown.some((i) => shortId(i.id) === institution.id);
      const inst = isCurrentlyThere
        ? lastKnown.find((i) => shortId(i.id) === institution.id) || lastKnown[0]
        : lastKnown[0];
      const name = a?.display_name || entry.name;
      const instName = inst?.display_name || institution.name;
      return {
        id,
        name,
        institution: instName,
        institutionCountry: inst?.country_code ?? institution.countryCode,
        orcid: a?.orcid || null,
        hIndex: a?.summary_stats?.h_index ?? null,
        worksCount: a?.works_count ?? entry.works.length,
        citedByCount: a?.cited_by_count ?? 0,
        topics: (a?.topics || []).slice(0, 3).map((t) => t.display_name),
        matchedWorks: entry.works
          .slice()
          .sort((x, y) => (y.year || 0) - (x.year || 0))
          .slice(0, 3),
        matchCount: entry.works.length,
        isCurrentlyThere,
        openAlexUrl: `https://openalex.org/authors/${id}`,
        googleScholarUrl: `https://scholar.google.com/scholar?q=${encodeURIComponent(
          `"${name}" ${instName}`
        )}`,
      };
    })
    .filter((c) => c.worksCount >= minWorks)
    .sort(
      (a, b) =>
        Number(b.isCurrentlyThere) - Number(a.isCurrentlyThere) ||
        b.matchCount - a.matchCount ||
        (b.hIndex || 0) - (a.hIndex || 0)
    )
    .slice(0, 15);

  return { institution, candidates, totalMatchingWorks: works.meta?.count || 0 };
}
