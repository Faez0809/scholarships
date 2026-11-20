"use client";

import React, { useState } from "react";
import { Check, X, ArrowRight, ChevronDown } from "lucide-react";
import { GuideStep, useGuide } from "../context/GuideContext";
import { useScholarship } from "../context/ScholarshipContext";

const STEP_COPY: Record<GuideStep, { title: string; hint: string; cta: string }> = {
  profile: {
    title: "Set your profile",
    hint: "Your CGPA, IELTS and target degree decide which scholarships you qualify for.",
    cta: "Set profile",
  },
  open: {
    title: "Open a scholarship",
    hint: "See requirements, money, documents and what to do next.",
    cta: "Show my matches",
  },
  save: {
    title: "Save one to your shortlist",
    hint: "Use the bookmark on a card to keep programs you like.",
    cta: "Browse",
  },
  supervisor: {
    title: "Find a supervisor",
    hint: "Search professors at a university who work on your topic.",
    cta: "Find supervisors",
  },
  outreach: {
    title: "Track your outreach",
    hint: "Save professors you email and get follow-up reminders.",
    cta: "My applications",
  },
};

export const GetStarted: React.FC = () => {
  const { steps, completedCount, isGuideVisible, dismissGuide, setIsProfileOpen } = useGuide();
  const { setActiveView, setActivePill } = useScholarship();
  const [expanded, setExpanded] = useState(false);

  if (!isGuideVisible) return null;

  const nextStep = steps.find((s) => !s.done)?.id;

  const go = (id: GuideStep) => {
    if (id === "profile") {
      setActiveView("scholarships");
      setIsProfileOpen(true);
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        document.getElementById("profile-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (id === "open") {
      setActiveView("scholarships");
      setActivePill("eligible");
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (id === "save") {
      setActiveView("scholarships");
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (id === "supervisor") {
      setActiveView("supervisors");
    } else {
      setActiveView("outreach");
    }
  };

  return (
    <section aria-labelledby="get-started-title" className="mb-6 rounded-xl border border-stone-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3 sm:px-5">
        <div>
          <h2 id="get-started-title" className="text-sm font-semibold text-stone-900">
            Get started
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {completedCount} of {steps.length} done
          </p>
        </div>
        <button
          type="button"
          onClick={dismissGuide}
          className="rounded-md p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Hide the getting started guide"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-1 bg-stone-100" aria-hidden="true">
        <div className="h-1 bg-blue-700 transition-all" style={{ width: `${(completedCount / steps.length) * 100}%` }} />
      </div>

      <ol className="divide-y divide-stone-100">
        {steps.map((s, i) => {
          const copy = STEP_COPY[s.id];
          const isNext = s.id === nextStep;
          return (
            <li
              key={s.id}
              className={`${isNext || expanded ? "flex" : "hidden"} items-center gap-3 px-4 py-3 sm:px-5 ${isNext ? "bg-blue-50/40" : ""}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  s.done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : isNext
                    ? "border-blue-700 text-blue-800"
                    : "border-stone-300 text-stone-500"
                }`}
                aria-hidden="true"
              >
                {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${s.done ? "text-stone-500 line-through decoration-stone-300" : "text-stone-900"}`}>
                  {copy.title}
                  <span className="sr-only">{s.done ? " (done)" : ""}</span>
                </p>
                {!s.done && <p className="text-xs text-stone-500">{copy.hint}</p>}
              </div>
              {!s.done && (
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isNext ? "bg-stone-900 text-white hover:bg-stone-800" : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {copy.cta}
                  {isNext && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-center gap-1 border-t border-stone-100 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900"
      >
        {expanded ? "Show only the next step" : `Show all ${steps.length} steps`}
        <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
      </button>
    </section>
  );
};
