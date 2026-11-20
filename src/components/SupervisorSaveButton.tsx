"use client";

import React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { SupervisorCandidate } from "../lib/openalex";
import { useOutreach } from "../context/OutreachContext";

/** Saves a researcher from the supervisor finder into the outreach tracker. */
export const SupervisorSaveButton: React.FC<{
  candidate: SupervisorCandidate;
  topic: string;
}> = ({ candidate, topic }) => {
  const { addContact, isSaved } = useOutreach();
  const saved = isSaved(candidate.id, candidate.name, candidate.institution);

  return (
    <button
      type="button"
      disabled={saved}
      onClick={() =>
        addContact({
          name: candidate.name,
          institution: candidate.institution,
          profileUrl: candidate.orcid || candidate.openAlexUrl,
          researchTopic: topic || candidate.topics[0] || "",
          paperTitle: candidate.matchedWorks[0]?.title || "",
          hIndex: candidate.hIndex,
          openAlexId: candidate.id,
          status: "Drafting",
        })
      }
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition ${
        saved
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900"
      }`}
      aria-label={saved ? `${candidate.name} is in your outreach list` : `Save ${candidate.name} to your outreach list`}
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
};
