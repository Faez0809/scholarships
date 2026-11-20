"use client";

import React, { useMemo, useState } from "react";
import { Search, X, SearchX, Plus, SlidersHorizontal } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { PillFilter, Region, SortOption } from "../types/scholarship";
import {
  calculateDaysRemaining,
  calculateNetSavings,
  checkEligibility,
  filterScholarships,
} from "../utils/scholarshipUtils";
import { ScholarshipCard } from "./ScholarshipCard";
import { ProfilePanel, ProfileSummaryBar } from "./ProfilePanel";
import { GetStarted } from "./GetStarted";
import { SaveProgressPrompt } from "./AuthDialog";
import { PageHeader, btn } from "./ui";

const REGIONS: ("All" | Region)[] = ["All", "Europe", "Asia", "Americas", "Oceania", "Middle East"];

type Quick = PillFilter | "saved";

export const BrowseView: React.FC = () => {
  const {
    scholarships,
    profile,
    updateProfileField,
    activePill,
    setActivePill,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isAdmin,
    setIsAddModalOpen,
    setEditingScholarship,
    stats,
  } = useScholarship();
  const { savedIds, setIsProfileOpen, completedCount, isGuideVisible } = useGuide();
  const [showSaved, setShowSaved] = useState(false);

  const counts = useMemo(() => {
    let masters = 0,
      phd = 0,
      eligible = 0,
      high = 0,
      closing = 0;
    for (const s of scholarships) {
      if (s.degrees.includes("Master's")) masters++;
      if (s.degrees.includes("PhD")) phd++;
      if (checkEligibility(s, profile).isEligible) eligible++;
      if (calculateNetSavings(s) > 300) high++;
      if (calculateDaysRemaining(s.deadline).isClosingSoon) closing++;
    }
    return { all: scholarships.length, masters, phd, eligible, high_savings: high, closing_soon: closing, saved: savedIds.length };
  }, [scholarships, profile, savedIds.length]);

  const results = useMemo(() => {
    const list = filterScholarships(scholarships, profile, activePill, searchQuery, sortBy);
    return showSaved ? list.filter((s) => savedIds.includes(s.id)) : list;
  }, [scholarships, profile, activePill, searchQuery, sortBy, showSaved, savedIds]);

  const quick: { id: Quick; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "eligible", label: "I qualify", count: counts.eligible },
    { id: "saved", label: "Saved", count: counts.saved },
    { id: "closing_soon", label: "Closing soon", count: counts.closing_soon },
    { id: "high_savings", label: "Save $300+/mo", count: counts.high_savings },
  ];

  const isActive = (id: Quick) => (id === "saved" ? showSaved : !showSaved && activePill === id);
  const choose = (id: Quick) => {
    if (id === "saved") {
      setShowSaved(true);
      setActivePill("all");
    } else {
      setShowSaved(false);
      setActivePill(id);
    }
  };

  const filtersOn =
    showSaved ||
    activePill !== "all" ||
    searchQuery.trim() !== "" ||
    profile.selectedRegion !== "All" ||
    profile.onlyEligible ||
    profile.fundingTypePreference !== "All" ||
    profile.supervisorPreference !== "All" ||
    profile.majorCategory !== "All";

  const clearAll = () => {
    setShowSaved(false);
    setActivePill("all");
    setSearchQuery("");
    updateProfileField("selectedRegion", "All");
    updateProfileField("onlyEligible", false);
    updateProfileField("fundingTypePreference", "All");
    updateProfileField("supervisorPreference", "All");
    updateProfileField("majorCategory", "All");
  };

  return (
    <div>
      <PageHeader
        title="Browse scholarships"
        description={
          <>
            {stats.total} fully funded Master&apos;s and PhD programs. Based on your profile you qualify for{" "}
            <strong className="font-semibold text-stone-900">{stats.eligibleCount}</strong>.
            <span className="hidden sm:inline"> Open any card to see requirements, money and next steps.</span>
          </>
        }
        actions={
          <>
            <span className="hidden sm:block lg:hidden">
              <button type="button" className={btn.secondary} onClick={() => setIsProfileOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Edit profile
              </button>
            </span>
            {isAdmin && (
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
            )}
          </>
        }
      />

      <GetStarted />
      <SaveProgressPrompt visible={!isGuideVisible && (completedCount >= 2 || savedIds.length > 0)} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProfilePanel />

        <section id="results" aria-labelledby="results-title" className="min-w-0 flex-1 scroll-mt-20">
          <h2 id="results-title" className="sr-only">
            Results
          </h2>
          <ProfileSummaryBar />

          {/* Toolbar */}
          <div className="rounded-xl border border-stone-200 bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, university, country or field"
                  aria-label="Search scholarships"
                  className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-9 text-sm placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <label className="sr-only" htmlFor="region-select">
                  Region
                </label>
                <select
                  id="region-select"
                  value={profile.selectedRegion}
                  onChange={(e) => updateProfileField("selectedRegion", e.target.value as "All" | Region)}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-800 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r === "All" ? "All regions" : `${r} (${stats.regionCounts[r] || 0})`}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="sort-select">
                  Sort by
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-800 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                >
                  <option value="deadline">Closing first</option>
                  <option value="savings_high">Most left over</option>
                  <option value="stipend_high">Highest stipend</option>
                  <option value="cgpa_low">Lowest CGPA needed</option>
                  <option value="name_asc">Name A–Z</option>
                </select>
              </div>
            </div>

            <div
              className="-mx-3 mt-3 flex gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Quick filters"
            >
              {quick.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => choose(q.id)}
                  aria-pressed={isActive(q.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive(q.id)
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  {q.label}
                  <span className={isActive(q.id) ? "text-stone-300" : "text-stone-500"}>{q.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result line */}
          <div className="mb-3 mt-4 flex items-center justify-between gap-2 text-sm">
            <p className="text-stone-600" aria-live="polite">
              Showing <strong className="font-semibold text-stone-900">{results.length}</strong> of {scholarships.length}
            </p>
            {filtersOn && (
              <button type="button" onClick={clearAll} className={btn.link}>
                Clear filters
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {results.map((s) => (
                <li key={s.id} className="min-w-0">
                  <ScholarshipCard scholarship={s} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
              <SearchX className="mx-auto h-6 w-6 text-stone-400" />
              <p className="mt-2 text-sm font-medium text-stone-900">
                {showSaved ? "You haven't saved any scholarships yet" : "No scholarships match these filters"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
                {showSaved
                  ? "Tap the bookmark on any card to keep it here."
                  : "Try clearing filters, choosing another region, or lowering the minimum money left each month in your profile."}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button type="button" className={btn.primary} onClick={clearAll}>
                  {showSaved ? "Browse all" : "Clear filters"}
                </button>
                {!showSaved && (
                  <button type="button" className={btn.secondary} onClick={() => setIsProfileOpen(true)}>
                    Review profile
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
