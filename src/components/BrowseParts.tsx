"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { FundingType, Region, SortOption, UserProfile } from "../types/scholarship";
import { selectClass } from "./ProfilePanel";
import { FUNDING_LABELS, useDialog } from "./ui";

export { listingStatus } from "../utils/listing";
export type { ListingStatus } from "../utils/listing";

/* ------------------------------------------------------------------ */
/* Quick start: three questions, then results                          */
/* ------------------------------------------------------------------ */

export const QuickStart: React.FC = () => {
  const { profile } = useScholarship();
  const { dismissQuickStart, isQuickStartDismissed, setIsProfileOpen } = useGuide();
  if (profile.isSet) return null;

  // After "Later", keep a single quiet line so the way back is always visible.
  if (isQuickStartDismissed) {
    return (
      <p className="mb-4 text-sm text-stone-600">
        These results are not matched to you yet.{" "}
        <button type="button" onClick={() => setIsProfileOpen(true)} className="font-medium text-blue-800 hover:underline">
          Add your profile
        </button>
      </p>
    );
  }

  return (
    <section
      aria-labelledby="quickstart-title"
      className="mb-5 rounded-xl border border-stone-200 bg-white px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
    >
      <div>
        <h2 id="quickstart-title" className="font-serif text-base font-semibold text-stone-900">
          Match scholarships to you
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Add your degree, field, CGPA, IELTS and passport. We&apos;ll mark the programs you qualify for and explain the rest.
        </p>
      </div>
      <div className="mt-3 flex shrink-0 items-center gap-4 sm:mt-0">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Add my profile
        </button>
        <button type="button" onClick={dismissQuickStart} className="text-sm text-stone-500 hover:text-stone-900">
          Later
        </button>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Filters sheet                                                       */
/* ------------------------------------------------------------------ */

const REGIONS: ("All" | Region)[] = ["All", "Europe", "Asia", "Americas", "Oceania", "Middle East"];

export function activeFilterCount(p: UserProfile): number {
  return [p.selectedRegion !== "All", p.fundingTypePreference !== "All", p.supervisorPreference !== "All"].filter(Boolean).length;
}

export const FiltersSheet: React.FC<{ open: boolean; onClose: () => void; resultCount: number }> = ({ open, onClose, resultCount }) => {
  const { profile, updateProfileField, stats, sortBy, setSortBy } = useScholarship();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, ref);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-labelledby="filters-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={ref}
        className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[380px] sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 id="filters-title" className="font-serif text-xl font-semibold text-stone-900">
            Filters
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Close filters">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <label className="block sm:hidden">
            <span className="mb-1.5 block font-medium text-stone-700">Sort by</span>
            <select className={selectClass} value={sortBy === "stipend_high" || sortBy === "cgpa_low" ? "deadline" : sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <option value="deadline">Closing soon</option>
              <option value="savings_high">Most money left</option>
              <option value="name_asc">Name</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-medium text-stone-700">Region</span>
            <select className={selectClass} value={profile.selectedRegion} onChange={(e) => updateProfileField("selectedRegion", e.target.value as "All" | Region)}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All regions" : `${r} (${stats.regionCounts[r] || 0})`}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-medium text-stone-700">Type of funding</span>
            <select
              className={selectClass}
              value={profile.fundingTypePreference || "All"}
              onChange={(e) => updateProfileField("fundingTypePreference", e.target.value as "All" | FundingType)}
            >
              <option value="All">Any type</option>
              {(Object.keys(FUNDING_LABELS) as FundingType[]).map((f) => (
                <option key={f} value={f}>
                  {FUNDING_LABELS[f]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-medium text-stone-700">Contacting a professor first</span>
            <select
              className={selectClass}
              value={profile.supervisorPreference || "All"}
              onChange={(e) => updateProfileField("supervisorPreference", e.target.value as UserProfile["supervisorPreference"])}
            >
              <option value="All">I don&apos;t mind</option>
              <option value="No Supervisor Needed">Only where I don&apos;t need to</option>
              <option value="Supervisor Allowed">Include where I need to</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3 border-t border-stone-100 p-4">
          <button
            type="button"
            onClick={() => {
              updateProfileField("selectedRegion", "All");
              updateProfileField("fundingTypePreference", "All");
              updateProfileField("supervisorPreference", "All");
            }}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Show {resultCount} result{resultCount === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
};
