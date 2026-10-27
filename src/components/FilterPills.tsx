"use client";

import React from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { PillFilter, SortOption } from "../types/scholarship";
import {
  Sparkles,
  GraduationCap,
  Award,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import {
  calculateDaysRemaining,
  calculateNetSavings,
  checkEligibility,
} from "../utils/scholarshipUtils";

export const FilterPills: React.FC = () => {
  const {
    scholarships,
    profile,
    activePill,
    setActivePill,
    sortBy,
    setSortBy,
  } = useScholarship();

  // Compute live pill counts
  const pillCounts = React.useMemo(() => {
    let masters = 0;
    let phd = 0;
    let eligible = 0;
    let highSavings = 0;
    let closingSoon = 0;

    for (const s of scholarships) {
      if (s.degrees.includes("Master's")) masters++;
      if (s.degrees.includes("PhD")) phd++;
      if (checkEligibility(s, profile).isEligible) eligible++;
      if (calculateNetSavings(s) > 300) highSavings++;
      const { isClosingSoon } = calculateDaysRemaining(s.deadline);
      if (isClosingSoon) closingSoon++;
    }

    return {
      all: scholarships.length,
      masters,
      phd,
      eligible,
      highSavings,
      closingSoon,
    };
  }, [scholarships, profile]);

  const pills: {
    id: PillFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
    colorClasses?: string;
  }[] = [
    {
      id: "all",
      label: "All Scholarships",
      icon: <Sparkles className="h-3.5 w-3.5" />,
      count: pillCounts.all,
    },
    {
      id: "masters",
      label: "Master's Only",
      icon: <GraduationCap className="h-3.5 w-3.5" />,
      count: pillCounts.masters,
    },
    {
      id: "phd",
      label: "PhD Only",
      icon: <Award className="h-3.5 w-3.5" />,
      count: pillCounts.phd,
    },
    {
      id: "eligible",
      label: "Eligible for My Profile",
      icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
      count: pillCounts.eligible,
      colorClasses: "hover:border-emerald-300",
    },
    {
      id: "high_savings",
      label: "High Net Savings (>$300/mo)",
      icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />,
      count: pillCounts.highSavings,
    },
    {
      id: "closing_soon",
      label: "Closing Soon",
      icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
      count: pillCounts.closingSoon,
      colorClasses: "hover:border-amber-300",
    },
  ];

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-zinc-200/80 sm:flex-row sm:items-center sm:justify-between">
      {/* Scrollable Horizontal Pill List */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {pills.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActivePill(pill.id)}
              className={`group flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <span className={isActive ? "text-white" : ""}>{pill.icon}</span>
              <span>{pill.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  isActive
                    ? "bg-zinc-800 text-zinc-200"
                    : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200/80"
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <label className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Sort:</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-2xs hover:border-zinc-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="deadline">Deadline (Soonest First)</option>
          <option value="savings_high">Net Savings (Highest First)</option>
          <option value="stipend_high">Stipend Amount (Highest First)</option>
          <option value="cgpa_low">Min CGPA (Lowest First)</option>
          <option value="name_asc">University Name (A–Z)</option>
        </select>
      </div>
    </div>
  );
};
