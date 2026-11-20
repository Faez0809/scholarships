"use client";

import React, { useMemo, useState } from "react";
import { Search, X, SearchX, Plus, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { PillFilter, SortOption } from "../types/scholarship";
import { calculateDaysRemaining, checkEligibility, filterScholarships } from "../utils/scholarshipUtils";
import { ScholarshipCard } from "./ScholarshipCard";
import { GetStarted } from "./GetStarted";
import { SaveProgressPrompt } from "./AuthDialog";
import { FiltersSheet, QuickStart, activeFilterCount } from "./BrowseParts";
import { PageHeader, btn } from "./ui";

type Quick = PillFilter | "saved";

export const BrowseView: React.FC = () => {
  const {
    scholarships,
    profile,
    activePill,
    setActivePill,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    updateProfileField,
    isAdmin,
    setIsAddModalOpen,
    setEditingScholarship,
  } = useScholarship();
  const { savedIds, setIsProfileOpen, completedCount, isGuideVisible } = useGuide();
  const [showSaved, setShowSaved] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const counts = useMemo(() => {
    let eligible = 0,
      closing = 0;
    for (const s of scholarships) {
      if (checkEligibility(s, profile).isEligible) eligible++;
      if (calculateDaysRemaining(s.deadline).isClosingSoon) closing++;
    }
    return { all: scholarships.length, eligible, closing_soon: closing, saved: savedIds.length };
  }, [scholarships, profile, savedIds.length]);

  const results = useMemo(() => {
    const list = filterScholarships(scholarships, profile, activePill, searchQuery, sortBy);
    return showSaved ? list.filter((s) => savedIds.includes(s.id)) : list;
  }, [scholarships, profile, activePill, searchQuery, sortBy, showSaved, savedIds]);

  const openNow = results.filter((s) => !calculateDaysRemaining(s.deadline).isExpired);
  const closed = results.filter((s) => calculateDaysRemaining(s.deadline).isExpired);

  const quick: { id: Quick; label: string; count: number | null }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "eligible", label: "I qualify", count: profile.isSet ? counts.eligible : null },
    { id: "saved", label: "Shortlist", count: counts.saved },
    { id: "closing_soon", label: "Closing soon", count: counts.closing_soon },
  ];

  const isActive = (id: Quick) => (id === "saved" ? showSaved : !showSaved && activePill === id);
  const choose = (id: Quick) => {
    if (id === "eligible" && !profile.isSet) {
      setIsProfileOpen(true);
      return;
    }
    setShowSaved(id === "saved");
    setActivePill(id === "saved" ? "all" : id);
  };

  const filterCount = activeFilterCount(profile);
  const anythingNarrowing =
    showSaved || activePill !== "all" || searchQuery.trim() !== "" || filterCount > 0 || profile.onlyEligible;

  const clearAll = () => {
    setShowSaved(false);
    setActivePill("all");
    setSearchQuery("");
    updateProfileField("selectedRegion", "All");
    updateProfileField("fundingTypePreference", "All");
    updateProfileField("supervisorPreference", "All");
    updateProfileField("onlyEligible", false);
  };

  const sortValue = sortBy === "stipend_high" || sortBy === "cgpa_low" ? "deadline" : sortBy;

  return (
    <div>
      <PageHeader
        title="Browse scholarships"
        description={
          profile.isSet ? (
            <>
              {counts.all} Master&apos;s and PhD scholarships, checked against official pages. You qualify for{" "}
              <strong className="font-semibold text-stone-900">{counts.eligible}</strong>.
            </>
          ) : (
            <>{counts.all} Master&apos;s and PhD scholarships, checked against official pages.</>
          )
        }
        actions={
          isAdmin ? (
            <button
              type="button"
              className={btn.primary}
              onClick={() => {
                setEditingScholarship(null);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add scholarship
            </button>
          ) : undefined
        }
      />

      <QuickStart />
      {profile.isSet && <GetStarted />}
      <SaveProgressPrompt visible={!isGuideVisible && (completedCount >= 2 || savedIds.length > 0)} />

      <section id="results" aria-labelledby="results-title" className="scroll-mt-20">
        <h2 id="results-title" className="sr-only">
          Results
        </h2>

        {/* Toolbar: one search line, a Filters button and a sort */}
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, university or country"
              aria-label="Search scholarships"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-9 text-sm placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-stone-500 hover:text-stone-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setFiltersOpen(true)} className={`${btn.secondary} shrink-0 px-3`}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sr-only sm:hidden">Filters</span>
            {filterCount > 0 && <span className="rounded-full bg-blue-700 px-1.5 text-[11px] font-semibold text-white">{filterCount}</span>}
          </button>
          <label className="sr-only" htmlFor="sort-select">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortValue}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="hidden shrink-0 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-800 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 sm:block"
          >
            <option value="deadline">Closing soon</option>
            <option value="savings_high">Most money left</option>
            <option value="name_asc">Name</option>
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div
            className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Quick filters"
          >
            {quick.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => choose(q.id)}
                aria-pressed={isActive(q.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  isActive(q.id) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                {q.label}
                {q.count !== null && <span className={isActive(q.id) ? "text-stone-300" : "text-stone-500"}>{q.count}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 mt-4 flex items-center justify-between gap-2 text-sm">
          <p className="text-stone-600" aria-live="polite">
            {openNow.length} open{closed.length > 0 ? ` · ${closed.length} closed for this round` : ""}
          </p>
          {anythingNarrowing && (
            <button type="button" onClick={clearAll} className={btn.link}>
              Clear filters
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
            <SearchX className="mx-auto h-6 w-6 text-stone-400" />
            <p className="mt-2 text-sm font-medium text-stone-900">{showSaved ? "Your shortlist is empty" : "No scholarships match"}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
              {showSaved ? "Tap the bookmark on any program to add it." : "Try fewer filters or a shorter search."}
            </p>
            <button type="button" className={`${btn.primary} mt-4`} onClick={clearAll}>
              {showSaved ? "Browse all programs" : "Show all programs"}
            </button>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {openNow.map((s) => (
                <li key={s.id} className="min-w-0">
                  <ScholarshipCard scholarship={s} />
                </li>
              ))}
            </ul>

            {closed.length > 0 && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowClosed((v) => !v)}
                  aria-expanded={showClosed}
                  className="inline-flex items-center gap-1 text-sm font-medium text-stone-700 hover:text-stone-900"
                >
                  Closed for this round ({closed.length}), opening again next cycle
                  <ChevronDown className={`h-4 w-4 transition ${showClosed ? "rotate-180" : ""}`} />
                </button>
                {showClosed && (
                  <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                    {closed.map((s) => (
                      <li key={s.id} className="min-w-0">
                        <ScholarshipCard scholarship={s} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} resultCount={results.length} />
    </div>
  );
};
