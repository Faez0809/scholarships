"use client";

import React, { useState } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { FundingType, MediumOfInstruction } from "../types/scholarship";
import {
  User,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  Globe2,
  RotateCcw,
  CheckCircle2,
  Filter,
  Landmark,
  UserCheck,
  ChevronDown,
} from "lucide-react";

const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "All", label: "All Majors & Fields" },
  { value: "Computer Science & AI", label: "Computer Science & AI" },
  { value: "Engineering", label: "Engineering & Tech" },
  { value: "Life Sciences", label: "Life & Bio Sciences" },
  { value: "Business & Social Sciences", label: "Business & Social Sciences" },
];

export const ProfileSidebar: React.FC = () => {
  const { profile, updateProfileField, resetProfile, stats } = useScholarship();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const matchPercentage =
    stats.total > 0 ? Math.round((stats.eligibleCount / stats.total) * 100) : 0;

  return (
    <aside className="w-full shrink-0 lg:w-80">
      {/* Mobile Collapsible Header / Filter Trigger */}
      <div className="lg:hidden">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs font-bold text-zinc-900">
                    Profile & Eligibility
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {stats.eligibleCount} Eligible ({matchPercentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">
                  CGPA {profile.cgpa.toFixed(2)} • IELTS {profile.ielts.toFixed(1)} • {profile.targetDegree}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
              aria-expanded={isMobileOpen}
            >
              <span>{isMobileOpen ? "Hide" : "Filter"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isMobileOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sidebar Panel (Always visible on lg+, Collapsible on mobile) */}
      <div
        className={`${
          isMobileOpen ? "block mt-3" : "hidden"
        } lg:block sticky top-20 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs transition-all`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Academic Profile
              </h2>
              <p className="text-[11px] text-zinc-500">Live eligibility & matching</p>
            </div>
          </div>

          <button
            onClick={resetProfile}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            title="Reset to default profile"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Live Match Summary Pill */}
        <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/40 p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Eligible Right Now
            </span>
            <span className="text-indigo-600 font-bold">
              {stats.eligibleCount} of {stats.total} ({matchPercentage}%)
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* 1. Target Degree */}
          <div>
            <label className="mb-1.5 flex items-center justify-between font-medium text-zinc-700">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-zinc-500" />
                Target Degree Level
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              {(["Both", "Master's", "PhD"] as const).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => updateProfileField("targetDegree", deg)}
                  className={`rounded-md py-1.5 text-center text-xs font-medium transition-all ${
                    profile.targetDegree === deg
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {deg}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Funding Model / Track */}
          <div>
            <label className="mb-1.5 flex items-center justify-between font-medium text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-zinc-500" />
                Funding Model Track
              </span>
            </label>
            <select
              value={profile.fundingTypePreference || "All"}
              onChange={(e) =>
                updateProfileField(
                  "fundingTypePreference",
                  e.target.value as "All" | FundingType
                )
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Funding Tracks ({stats.total})</option>
              <option value="Gov / Multi-Uni">
                🏛️ Govt &amp; Umbrella (CSC, Erasmus, DAAD)
              </option>
              <option value="University Direct">
                🎓 University Fellowships (KAUST, Gates, ETH)
              </option>
              <option value="Supervisor / RA-TA">
                🔬 Supervisor RA / TA (Canada, USA, Aus)
              </option>
            </select>
          </div>

          {/* 3. Supervisor Requirement Preference */}
          <div>
            <label className="mb-1.5 flex items-center justify-between font-medium text-zinc-700">
              <span className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-zinc-500" />
                Supervisor Contact Track
              </span>
            </label>
            <select
              value={profile.supervisorPreference || "All"}
              onChange={(e) =>
                updateProfileField(
                  "supervisorPreference",
                  e.target.value as any
                )
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">Any (Central or Supervisor-backed)</option>
              <option value="No Supervisor Needed">
                ✅ Direct Apply (No Professor Contact Needed)
              </option>
              <option value="Supervisor Allowed">
                🤝 Professor Contact / Lab Match Allowed
              </option>
            </select>
          </div>

          {/* 4. Major / Field */}
          <div>
            <label className="mb-1.5 flex items-center justify-between font-medium text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-zinc-500" />
                Major / Field Category
              </span>
            </label>
            <select
              value={profile.majorCategory}
              onChange={(e) => updateProfileField("majorCategory", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {FIELD_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. My CGPA */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-zinc-700">My CGPA (4.00 Scale)</label>
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 shadow-2xs border border-zinc-200">
                {profile.cgpa.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="2.00"
              max="4.00"
              step="0.05"
              value={profile.cgpa}
              onChange={(e) =>
                updateProfileField("cgpa", parseFloat(e.target.value))
              }
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>2.00</span>
              <span>3.00</span>
              <span>3.50</span>
              <span>4.00</span>
            </div>
          </div>

          {/* 6. My IELTS Score */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-zinc-700">My IELTS Band Score</label>
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-indigo-600 shadow-2xs border border-zinc-200">
                {profile.ielts.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.0"
              step="0.5"
              value={profile.ielts}
              onChange={(e) =>
                updateProfileField("ielts", parseFloat(e.target.value))
              }
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>5.0</span>
              <span>6.5</span>
              <span>7.5</span>
              <span>9.0</span>
            </div>
          </div>

          {/* 7. Medium of Instruction */}
          <div>
            <label className="mb-1.5 flex items-center justify-between font-medium text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-zinc-500" />
                Medium of Instruction
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
              {(["English Only", "Any"] as MediumOfInstruction[]).map((med) => (
                <button
                  key={med}
                  type="button"
                  onClick={() => updateProfileField("mediumPreference", med)}
                  className={`rounded-md py-1.5 text-center text-xs font-medium transition-all ${
                    profile.mediumPreference === med
                      ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Minimum Desired Net Savings */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-zinc-700 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-emerald-600" />
                Min Monthly Savings
              </label>
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-emerald-600 shadow-2xs border border-zinc-200">
                ${profile.minSavingsDesired}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={profile.minSavingsDesired}
              onChange={(e) =>
                updateProfileField(
                  "minSavingsDesired",
                  parseInt(e.target.value, 10)
                )
              }
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-emerald-600"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>$0</span>
              <span>$300</span>
              <span>$750</span>
              <span>$1500+</span>
            </div>
          </div>

          {/* 9. 100% Eligible Toggle */}
          <div className="pt-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 transition hover:bg-emerald-50">
              <div className="pr-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-950">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Eligible Only</span>
                </div>
                <p className="mt-0.5 text-[10px] text-emerald-800/80">
                  Hide scholarships not meeting your CGPA, IELTS, degree, or savings
                </p>
              </div>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={profile.onlyEligible}
                  onChange={(e) =>
                    updateProfileField("onlyEligible", e.target.checked)
                  }
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-300 peer-checked:bg-emerald-600 transition-colors peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
              </div>
            </label>
          </div>

          {/* Mobile Close/Apply Button */}
          <div className="pt-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="w-full rounded-xl bg-zinc-900 py-2.5 text-center text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
            >
              Apply &amp; View Matching Scholarships ({stats.eligibleCount})
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
