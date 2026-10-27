"use client";

import React from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { Region } from "../types/scholarship";

const REGIONS: { id: "All" | Region; label: string; flag: string }[] = [
  { id: "All", label: "All Regions", flag: "🌍" },
  { id: "Europe", label: "Europe", flag: "🇪🇺" },
  { id: "Asia", label: "Asia", flag: "🌏" },
  { id: "Americas", label: "Americas", flag: "🌎" },
  { id: "Oceania", label: "Oceania", flag: "🦘" },
  { id: "Middle East", label: "Middle East", flag: "🐪" },
];

export const WorldRegionBar: React.FC = () => {
  const { profile, updateProfileField, stats } = useScholarship();

  return (
    <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1.5 pt-1 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {REGIONS.map((region) => {
        const isSelected = profile.selectedRegion === region.id;
        const count = stats.regionCounts[region.id] ?? 0;

        return (
          <button
            key={region.id}
            type="button"
            onClick={() => updateProfileField("selectedRegion", region.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
              isSelected
                ? "bg-zinc-900 text-white shadow-xs font-semibold"
                : "border border-zinc-200/90 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <span className="text-sm leading-none">{region.flag}</span>
            <span>{region.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                isSelected
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
