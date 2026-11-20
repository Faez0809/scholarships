"use client";

import React from "react";
import { GraduationCap, Users, Mail } from "lucide-react";
import { AppView, useScholarship } from "../context/ScholarshipContext";

const TABS: { id: AppView; label: string; short: string; icon: React.ReactNode }[] = [
  { id: "scholarships", label: "Scholarships", short: "Scholarships", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "supervisors", label: "Find Supervisors", short: "Supervisors", icon: <Users className="h-4 w-4" /> },
  { id: "outreach", label: "My Outreach", short: "Outreach", icon: <Mail className="h-4 w-4" /> },
];

export const ViewTabs: React.FC<{ badges?: Partial<Record<AppView, number>> }> = ({ badges }) => {
  const { activeView, setActiveView } = useScholarship();

  return (
    <nav aria-label="Sections" className="mb-5 border-b border-zinc-200">
      <ul className="-mb-px grid grid-cols-3 sm:flex sm:gap-6">
        {TABS.map((tab) => {
          const active = activeView === tab.id;
          const count = badges?.[tab.id];
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveView(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center justify-center gap-1.5 border-b-2 px-1 pb-2.5 pt-1 text-[13px] font-medium transition sm:justify-start sm:text-sm ${
                  active
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                }`}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {typeof count === "number" && count > 0 && (
                  <span className="rounded-full bg-zinc-100 px-1.5 text-[11px] font-semibold text-zinc-700">
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
