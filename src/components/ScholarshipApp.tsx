"use client";

import React from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { filterScholarships } from "../utils/scholarshipUtils";
import { Navbar } from "./Navbar";
import { WorldRegionBar } from "./WorldRegionBar";
import { FilterPills } from "./FilterPills";
import { ProfileSidebar } from "./ProfileSidebar";
import { ScholarshipCard } from "./ScholarshipCard";
import { ScholarshipDrawer } from "./ScholarshipDrawer";
import { AdminModal } from "./AdminModal";
import { PasscodeModal } from "./PasscodeModal";
import {
  GraduationCap,
  Sparkles,
  SearchX,
  RotateCcw,
  Plus,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export const ScholarshipApp: React.FC = () => {
  const {
    scholarships,
    profile,
    updateProfileField,
    activePill,
    setActivePill,
    searchQuery,
    setSearchQuery,
    sortBy,
    isAdmin,
    setIsAddModalOpen,
    setEditingScholarship,
    resetProfile,
  } = useScholarship();

  // Filter & sort scholarships
  const filteredScholarships = React.useMemo(() => {
    return filterScholarships(
      scholarships,
      profile,
      activePill,
      searchQuery,
      sortBy
    );
  }, [scholarships, profile, activePill, searchQuery, sortBy]);

  const hasActiveFilters =
    activePill !== "all" ||
    profile.onlyEligible ||
    profile.selectedRegion !== "All" ||
    profile.fundingTypePreference !== "All" ||
    profile.supervisorPreference !== "All" ||
    profile.majorCategory !== "All" ||
    profile.targetDegree !== "Both" ||
    searchQuery.trim().length > 0;

  const handleClearAllFilters = () => {
    setActivePill("all");
    setSearchQuery("");
    resetProfile();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6">
        {/* World Region Selector */}
        <div className="mb-3">
          <WorldRegionBar />
        </div>

        {/* Classification Pills Bar */}
        <FilterPills />

        {/* Content Body: Sidebar + Main Grid */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Sidebar: My Academic Profile & Requirements */}
          <ProfileSidebar />

          {/* Right Area: Scholarship Grid */}
          <section className="flex-1 min-w-0">
            {/* Header info row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                  Global Graduate Scholarships
                </h1>
                <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                  {filteredScholarships.length} of {scholarships.length} available
                </span>
                {profile.selectedRegion !== "All" && (
                  <span className="rounded-full bg-zinc-900 text-white px-2 py-0.5 text-[11px] font-semibold">
                    {profile.selectedRegion}
                  </span>
                )}
                {profile.fundingTypePreference !== "All" && (
                  <span className="rounded-full bg-purple-100 text-purple-900 px-2 py-0.5 text-[11px] font-semibold">
                    {profile.fundingTypePreference}
                  </span>
                )}
                {profile.onlyEligible && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    100% Eligible Mode
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Grid of Scholarship Cards */}
            {filteredScholarships.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filteredScholarships.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-zinc-800">
                  No scholarships match your current filters
                </h3>
                <p className="mt-1 max-w-md text-xs text-zinc-500 leading-relaxed">
                  Try switching world regions, relaxing your supervisor requirement, or lowering the minimum desired net monthly savings.
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingScholarship(null);
                        setIsAddModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Scholarship</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">ScholarTrack</span>
            <span>—</span>
            <span>Fully Funded Master&apos;s &amp; PhD Scholarship Discovery</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-600">
              Scholarship Discovery &amp; Management • v1.0
            </span>
            <span className="text-zinc-400">Default Admin PIN: 1234</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-Over Drawer */}
      <ScholarshipDrawer />
      <AdminModal />
      <PasscodeModal />
    </div>
  );
};
