"use client";

import React, { useMemo, useState } from "react";
import { CalendarPlus, Bookmark, ChevronDown, AlertCircle } from "lucide-react";
import { useScholarship } from "../context/ScholarshipContext";
import { APPLICATION_STAGES, ApplicationStage, useGuide } from "../context/GuideContext";
import { calculateDaysRemaining } from "../utils/scholarshipUtils";
import { downloadCalendar } from "../utils/calendar";
import { OutreachTracker } from "./OutreachTracker";
import { listingStatus } from "./BrowseParts";
import { PageHeader, btn } from "./ui";

type Tab = "programs" | "professors";

export const ApplicationsView: React.FC = () => {
  const [tab, setTab] = useState<Tab>("programs");
  return (
    <div>
      <PageHeader
        title="My applications"
        description="Track each program on your shortlist from planning to result, and the professors you contact."
      />
      <div className="mb-5 border-b border-stone-200" role="tablist" aria-label="Applications">
        <div className="-mb-px flex gap-6">
          {(
            [
              ["programs", "Scholarships"],
              ["professors", "Professors"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`border-b-2 pb-2.5 text-sm font-medium ${
                tab === id ? "border-blue-700 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === "programs" ? <ProgramTracker /> : <OutreachTracker embedded />}
    </div>
  );
};

const ProgramTracker: React.FC = () => {
  const { scholarships, setActiveView, setSelectedScholarship } = useScholarship();
  const { savedIds, getApplication, updateApplication, toggleSavedScholarship } = useGuide();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(
    () =>
      savedIds
        .map((id) => scholarships.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => !!s)
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [savedIds, scholarships]
  );

  const upcoming = items.filter((s) => {
    const d = calculateDaysRemaining(s.deadline);
    const stage = getApplication(s.id).stage;
    return !d.isExpired && d.days <= 30 && (stage === "Planning" || stage === "Preparing");
  });

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
        <Bookmark className="mx-auto h-6 w-6 text-stone-400" />
        <p className="mt-2 text-sm font-medium text-stone-900">Your shortlist is empty</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">Bookmark programs while browsing and track them here.</p>
        <button type="button" onClick={() => setActiveView("scholarships")} className={`${btn.primary} mt-4`}>
          Browse scholarships
        </button>
      </div>
    );
  }

  return (
    <div>
      {upcoming.length > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-medium">Due within 30 days:</span> {upcoming.map((s) => s.name).join(", ")}.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-stone-600">
          {items.length} on your shortlist. Add the deadlines to your calendar to get reminders 2 weeks and 3 days before.
        </p>
        <button type="button" onClick={() => downloadCalendar(items, "scholarship-deadlines.ics")} className={btn.secondary}>
          <CalendarPlus className="h-4 w-4" /> Add all to calendar
        </button>
      </div>

      {APPLICATION_STAGES.map((stage) => {
        const inStage = items.filter((s) => getApplication(s.id).stage === stage);
        if (inStage.length === 0) return null;
        return (
          <section key={stage} className="mb-6" aria-labelledby={`stage-${stage}`}>
            <h3 id={`stage-${stage}`} className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              {stage} · {inStage.length}
            </h3>
            <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {inStage.map((s) => {
                const app = getApplication(s.id);
                const status = listingStatus(s);
                const open = openId === s.id;
                return (
                  <li key={s.id} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedScholarship(s)}
                          className="text-left font-serif text-base font-semibold text-stone-900 hover:text-blue-800"
                        >
                          {s.name}
                        </button>
                        <p className={`text-sm ${status.className}`}>{status.text}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <label className="sr-only" htmlFor={`stage-select-${s.id}`}>
                          Stage for {s.name}
                        </label>
                        <select
                          id={`stage-select-${s.id}`}
                          value={app.stage}
                          onChange={(e) => updateApplication(s.id, { stage: e.target.value as ApplicationStage })}
                          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                        >
                          {APPLICATION_STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : s.id)}
                          aria-expanded={open}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                        >
                          Details <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-4 grid gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-stone-700">Referees</span>
                          <textarea
                            value={app.referees}
                            onChange={(e) => updateApplication(s.id, { referees: e.target.value })}
                            placeholder="Who is writing your letters, and have they confirmed?"
                            className="min-h-20 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-stone-700">Notes</span>
                          <textarea
                            value={app.notes}
                            onChange={(e) => updateApplication(s.id, { notes: e.target.value })}
                            placeholder="Portal login reminders, essay ideas, interview dates…"
                            className="min-h-20 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                          />
                        </label>
                        {stage === "Result" && (
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium text-stone-700">Outcome</span>
                            <select
                              value={app.result || ""}
                              onChange={(e) => updateApplication(s.id, { result: e.target.value as "" | "Accepted" | "Rejected" | "Waitlisted" })}
                              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Waiting</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Waitlisted">Waitlisted</option>
                              <option value="Rejected">Not selected</option>
                            </select>
                          </label>
                        )}
                        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                          <button type="button" onClick={() => setSelectedScholarship(s)} className={btn.link}>
                            Documents and next steps
                          </button>
                          <button type="button" onClick={() => downloadCalendar([s], `${s.id}-deadline.ics`)} className={btn.link}>
                            Add deadline to calendar
                          </button>
                          <button type="button" onClick={() => toggleSavedScholarship(s.id)} className="ml-auto text-sm text-stone-500 hover:text-red-700">
                            Remove from shortlist
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
