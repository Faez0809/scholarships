"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { searchUniversityTitles } from "../lib/wiki";
import { UniversityGallery } from "./UniversityGallery";
import { PageHeader, btn } from "./ui";

/** Look up any university: intro, campus photos, and the scholarships we list there. */
export const UniversitiesView: React.FC = () => {
  const { scholarships, setSelectedScholarship, openSupervisorFinder } = useScholarship();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Universities that appear in the catalog, for quick picks
  const catalogUniversities = useMemo(() => {
    const names = new Set<string>();
    scholarships.forEach((s) => {
      if (s.partnerUniversities?.length) s.partnerUniversities.forEach((u) => names.add(u.name));
      else if (s.fundingType !== "Gov / Multi-Uni") names.add(s.university);
    });
    // Leave out groupings that are not a single university, and keep the short form of a name
    // when the list also has a longer version of it (e.g. "EPFL" and "EPFL (École ...)").
    const byKey = new Map<string, string>();
    Array.from(names)
      .filter((n) => !/\b(with|ministry|universities|institutes|trust)\b/i.test(n))
      .forEach((n) => {
        const short = n.replace(/^the /i, "");
        byKey.set(short.toLowerCase(), short);
      });
    const list = Array.from(byKey.values());
    return list
      .filter((n) => !list.some((other) => other !== n && n.startsWith(other + " (")))
      .sort((a, b) => a.localeCompare(b));
  }, [scholarships]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const t = window.setTimeout(() => {
      searchUniversityTitles(q, controller.signal)
        .then(setSuggestions)
        .catch(() => {});
    }, 300);
    return () => {
      window.clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const related = useMemo(() => {
    if (!selected) return [];
    const key = selected.toLowerCase().replace(/^the /, "");
    return scholarships.filter(
      (s) =>
        s.university.toLowerCase().includes(key) ||
        key.includes(s.university.toLowerCase()) ||
        s.partnerUniversities?.some((u) => u.name.toLowerCase().includes(key) || key.includes(u.name.toLowerCase().replace(/\s*\(.*\)/, "")))
    );
  }, [selected, scholarships]);

  return (
    <section aria-labelledby="universities-title">
      <PageHeader
        id="universities-title"
        title="Universities"
        description="Look up a university to read a short introduction and see photos of the campus, then find its scholarships and professors."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) setSelected(suggestions[0] || query.trim());
          setShowSuggestions(false);
        }}
        className="relative mb-6"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            if (e.target.value.trim().length < 3) setSuggestions([]);
          }}
          placeholder="Search a university, e.g. University of Toronto"
          aria-label="Search a university"
          className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
        />
        {showSuggestions && suggestions.length > 0 && query.trim().length >= 3 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(s);
                    setQuery(s);
                    setShowSuggestions(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-stone-800 hover:bg-stone-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {selected ? (
        <article className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="font-serif text-2xl font-semibold text-stone-900">{selected}</h2>
            <button type="button" onClick={() => openSupervisorFinder(selected, "")} className={`${btn.secondary} shrink-0`}>
              <Users className="h-4 w-4" /> Find supervisors here
            </button>
          </div>
          <div className="mt-4">
            <UniversityGallery name={selected} />
          </div>
          <div className="mt-6 border-t border-stone-100 pt-4">
            <h3 className="text-sm font-semibold text-stone-900">Scholarships we list here</h3>
            {related.length > 0 ? (
              <ul className="mt-2 divide-y divide-stone-100">
                {related.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedScholarship(s)}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm hover:text-blue-800"
                    >
                      <span className="font-medium text-stone-900">{s.name}</span>
                      <span className="shrink-0 text-stone-500">{s.degrees.join(" & ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-stone-500">None in our list yet. You can still look for professors here.</p>
            )}
          </div>
        </article>
      ) : (
        <div>
          <h2 className="mb-1 text-sm font-semibold text-stone-900">Universities in our scholarship list</h2>
          <ul className="grid grid-cols-1 divide-y divide-stone-100 border-y border-stone-100 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
            {catalogUniversities.map((u) => (
              <li key={u}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(u);
                    setQuery(u);
                    setShowSuggestions(false);
                  }}
                  className="w-full py-2.5 text-left text-sm text-stone-800 hover:text-blue-800 sm:border-b sm:border-stone-100"
                >
                  {u}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
