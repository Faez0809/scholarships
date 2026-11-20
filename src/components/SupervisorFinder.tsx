"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Building2,
  BookOpen,
  ExternalLink,
  Loader2,
  AlertCircle,
  Users,
  X,
  Quote,
  FileText,
} from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import {
  findSupervisors,
  InstitutionOption,
  searchInstitutions,
  SupervisorCandidate,
  SupervisorSearchResult,
} from "../lib/openalex";
import { SupervisorSaveButton } from "./SupervisorSaveButton";

const YEAR_OPTIONS = [
  { value: 3, label: "Last 3 years" },
  { value: 5, label: "Last 5 years" },
  { value: 8, label: "Last 8 years" },
];

export const SupervisorFinder: React.FC = () => {
  const { supervisorPrefill, scholarships } = useScholarship();

  const [universityQuery, setUniversityQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionOption | null>(null);
  const [suggestions, setSuggestions] = useState<InstitutionOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [topic, setTopic] = useState("");
  const [sinceYears, setSinceYears] = useState(5);
  const [hideEarlyCareer, setHideEarlyCareer] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SupervisorSearchResult | null>(null);

  const searchAbort = useRef<AbortController | null>(null);
  const suggestAbort = useRef<AbortController | null>(null);
  const lastPrefillNonce = useRef<number | null>(null);

  // Universities from supervisor-funded programs, offered as quick picks.
  const quickPicks = useMemo(() => {
    const names = new Set<string>();
    scholarships
      .filter((s) => s.fundingType === "Supervisor / RA-TA" || s.supervisorRequired === "Mandatory Before Applying")
      .forEach((s) => {
        if (s.partnerUniversities?.length) {
          s.partnerUniversities.forEach((u) => names.add(u.name));
        } else {
          names.add(s.university);
        }
      });
    return Array.from(names).slice(0, 8);
  }, [scholarships]);

  // Institution autocomplete (debounced)
  useEffect(() => {
    if (selectedInstitution && selectedInstitution.name === universityQuery) return;
    const q = universityQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      suggestAbort.current?.abort();
      const controller = new AbortController();
      suggestAbort.current = controller;
      setIsSuggesting(true);
      try {
        const list = await searchInstitutions(q, controller.signal);
        setSuggestions(list);
      } catch {
        // Autocomplete is best-effort; the main search resolves names too.
      } finally {
        if (!controller.signal.aborted) setIsSuggesting(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [universityQuery, selectedInstitution]);

  const runSearch = async (institutionName: string, topicText: string, preset?: InstitutionOption | null) => {
    setError(null);
    setShowSuggestions(false);
    const name = institutionName.trim();
    if (!name) {
      setError("Enter a university to search.");
      return;
    }

    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setIsSearching(true);
    setResult(null);

    try {
      let institution = preset && preset.name === name ? preset : null;
      if (!institution) {
        const matches = await searchInstitutions(name, controller.signal);
        institution = matches[0] || null;
        if (institution) {
          setSelectedInstitution(institution);
          setUniversityQuery(institution.name);
        }
      }
      if (!institution) {
        setError(`No university matching "${name}" was found. Try the full official name.`);
        return;
      }
      const data = await findSupervisors({
        institution,
        topic: topicText,
        sinceYears,
        minWorks: hideEarlyCareer ? 15 : 1,
        signal: controller.signal,
      });
      setResult(data);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setError((err as Error)?.message || "Search failed. Please try again.");
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  };

  // Apply a prefill coming from a scholarship card or drawer
  useEffect(() => {
    if (!supervisorPrefill || supervisorPrefill.nonce === lastPrefillNonce.current) return;
    lastPrefillNonce.current = supervisorPrefill.nonce;
    setUniversityQuery(supervisorPrefill.university);
    setSelectedInstitution(null);
    setTopic(supervisorPrefill.topic);
    runSearch(supervisorPrefill.university, supervisorPrefill.topic, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supervisorPrefill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(universityQuery, topic, selectedInstitution);
  };

  const chooseSuggestion = (option: InstitutionOption) => {
    setSelectedInstitution(option);
    setUniversityQuery(option.name);
    setShowSuggestions(false);
  };

  return (
    <section aria-labelledby="supervisor-finder-title" className="space-y-5">
      <header>
        <h1 id="supervisor-finder-title" className="text-lg font-semibold tracking-tight text-zinc-900">
          Find Supervisors
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">
          Search a university for researchers who have recently published on your topic. Results come
          from the open OpenAlex research database and show publication activity, not job titles, so
          check each profile before you write.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
          {/* University */}
          <div className="relative">
            <label htmlFor="sf-university" className="mb-1 block text-xs font-medium text-zinc-700">
              University
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="sf-university"
                type="text"
                autoComplete="off"
                value={universityQuery}
                onChange={(e) => {
                  setUniversityQuery(e.target.value);
                  setSelectedInstitution(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. University of Waterloo"
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                aria-autocomplete="list"
                aria-controls="sf-university-list"
                aria-expanded={showSuggestions && suggestions.length > 0}
              />
              {isSuggesting && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul
                id="sf-university-list"
                role="listbox"
                className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
              >
                {suggestions.map((opt) => (
                  <li key={opt.id} role="option" aria-selected={selectedInstitution?.id === opt.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => chooseSuggestion(opt)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    >
                      <span className="truncate text-zinc-900">{opt.name}</span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {[opt.city, opt.countryCode].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Topic */}
          <div>
            <label htmlFor="sf-topic" className="mb-1 block text-xs font-medium text-zinc-700">
              Research topic or keywords
            </label>
            <div className="relative">
              <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="sf-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. reinforcement learning"
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 md:w-auto"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600">
          <label className="flex items-center gap-2">
            <span>Published in</span>
            <select
              value={sinceYears}
              onChange={(e) => setSinceYears(Number(e.target.value))}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800 focus:border-zinc-900 focus:outline-none"
            >
              {YEAR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hideEarlyCareer}
              onChange={(e) => setHideEarlyCareer(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300 accent-zinc-900"
            />
            <span>Hide researchers with fewer than 15 publications</span>
          </label>
        </div>

        {quickPicks.length > 0 && !result && !isSearching && (
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <p className="text-xs text-zinc-500">From supervisor-funded programs in your catalog:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPicks.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setUniversityQuery(name);
                    setSelectedInstitution(null);
                  }}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 hover:border-zinc-300 hover:bg-white"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      <div aria-live="polite">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSearching && <ResultsSkeleton />}

        {!isSearching && !error && !result && <EmptyState />}

        {!isSearching && result && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-zinc-700">
                <span className="font-semibold text-zinc-900">{result.candidates.length}</span>{" "}
                {result.candidates.length === 1 ? "researcher" : "researchers"} at{" "}
                <span className="font-semibold text-zinc-900">{result.institution.name}</span>
                {topic.trim() ? (
                  <>
                    {" "}publishing on <span className="font-semibold text-zinc-900">{topic.trim()}</span>
                  </>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
              >
                <X className="h-3.5 w-3.5" /> Clear results
              </button>
            </div>

            {result.candidates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center">
                <p className="text-sm font-medium text-zinc-800">No matching researchers found</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Try a broader topic (for example &quot;robotics&quot; instead of a paper title), a longer
                  time range, or turn off the publication filter.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {result.candidates.map((c) => (
                  <li key={c.id}>
                    <CandidateCard candidate={c} topic={topic.trim()} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const CandidateCard: React.FC<{ candidate: SupervisorCandidate; topic: string }> = ({
  candidate: c,
  topic,
}) => (
  <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-zinc-900">{c.name}</h3>
        <p className="truncate text-xs text-zinc-500">{c.institution}</p>
        {!c.isCurrentlyThere && (
          <p className="mt-1 text-[11px] text-amber-700">Latest affiliation differs; may have moved.</p>
        )}
      </div>
      <SupervisorSaveButton candidate={c} topic={topic} />
    </div>

    <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-zinc-50 p-2 text-center">
      <div>
        <dt className="text-[10px] uppercase tracking-wide text-zinc-500">h-index</dt>
        <dd className="font-mono text-sm font-semibold text-zinc-900">{c.hIndex ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Works</dt>
        <dd className="font-mono text-sm font-semibold text-zinc-900">{c.worksCount.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-[10px] uppercase tracking-wide text-zinc-500">On topic</dt>
        <dd className="font-mono text-sm font-semibold text-zinc-900">{c.matchCount}</dd>
      </div>
    </dl>

    {c.topics.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1">
        {c.topics.map((t) => (
          <span key={t} className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600">
            {t}
          </span>
        ))}
      </div>
    )}

    {c.matchedWorks.length > 0 && (
      <div className="mt-3">
        <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          <FileText className="h-3 w-3" /> Recent papers
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {c.matchedWorks.map((w) => (
            <li key={w.id} className="text-xs leading-snug">
              <a
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-800 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-700"
              >
                {w.title}
              </a>
              <span className="ml-1 text-zinc-500">
                {w.year ?? ""}
                {w.citedBy > 0 ? ` · ${w.citedBy} citations` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs">
      <a href={c.googleScholarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950">
        <Quote className="h-3 w-3" /> Google Scholar
      </a>
      {c.orcid && (
        <a href={c.orcid} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950">
          <ExternalLink className="h-3 w-3" /> ORCID
        </a>
      )}
      <a href={c.openAlexUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950">
        <ExternalLink className="h-3 w-3" /> OpenAlex
      </a>
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(`"${c.name}" ${c.institution} faculty profile`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950"
      >
        <Building2 className="h-3 w-3" /> Faculty page
      </a>
    </div>
  </article>
);

const ResultsSkeleton: React.FC = () => (
  <div className="grid gap-3 lg:grid-cols-2" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4">
        <div className="h-4 w-1/2 rounded bg-zinc-200" />
        <div className="mt-2 h-3 w-1/3 rounded bg-zinc-100" />
        <div className="mt-4 h-12 rounded bg-zinc-100" />
        <div className="mt-3 h-3 w-5/6 rounded bg-zinc-100" />
        <div className="mt-2 h-3 w-4/6 rounded bg-zinc-100" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center sm:p-8">
    <Users className="mx-auto h-6 w-6 text-zinc-400" />
    <p className="mt-2 text-sm font-medium text-zinc-800">Search for potential supervisors</p>
    <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
      Pick a university and a research topic. You can also open a supervisor-funded program and use
      &quot;Find supervisors&quot; to fill this in automatically.
    </p>
  </div>
);
