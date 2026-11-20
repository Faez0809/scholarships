"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useScholarship } from "./ScholarshipContext";
import { useOutreach } from "./OutreachContext";

/**
 * First-visit guidance and the saved-scholarships shortlist.
 * Everything is stored in this browser only.
 */

export type GuideStep = "profile" | "open" | "save" | "supervisor" | "outreach";

export const APPLICATION_STAGES = ["Planning", "Preparing", "Submitted", "Interview", "Result"] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export interface ApplicationEntry {
  stage: ApplicationStage;
  notes: string;
  referees: string;
  result?: "Accepted" | "Rejected" | "Waitlisted" | "";
  updatedAt: string;
}

export interface GuideState {
  profileConfirmed: boolean;
  openedScholarship: boolean;
  searchedSupervisors: boolean;
  dismissed: boolean;
  quickStartDismissed?: boolean;
  /** Application tracker entries, keyed by scholarship id (saved with the account). */
  applications?: Record<string, ApplicationEntry>;
}

interface GuideContextType {
  savedIds: string[];
  isSavedScholarship: (id: string) => boolean;
  toggleSavedScholarship: (id: string) => void;
  steps: { id: GuideStep; done: boolean }[];
  completedCount: number;
  isGuideVisible: boolean;
  dismissGuide: () => void;
  reopenGuide: () => void;
  markStep: (step: "profile" | "supervisor") => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  guideState: GuideState;
  replaceGuide: (savedIds: string[], guide: Partial<GuideState>) => void;
  isQuickStartDismissed: boolean;
  dismissQuickStart: () => void;
  applications: Record<string, ApplicationEntry>;
  getApplication: (id: string) => ApplicationEntry;
  updateApplication: (id: string, changes: Partial<ApplicationEntry>) => void;
}

const STORAGE_SAVED = "scholar_track_v2_saved_scholarships";
const STORAGE_GUIDE = "scholar_track_v2_guide";

const EMPTY_GUIDE: GuideState = {
  profileConfirmed: false,
  openedScholarship: false,
  searchedSupervisors: false,
  dismissed: false,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); the session still works.
  }
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const { selectedScholarship } = useScholarship();
  const { contacts } = useOutreach();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [guide, setGuide] = useState<GuideState>(EMPTY_GUIDE);
  const [loaded, setLoaded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hydrate once on the client; localStorage does not exist during server rendering.
  useEffect(() => {
    const saved = read<string[]>(STORAGE_SAVED, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedIds(Array.isArray(saved) ? saved : []);
    setGuide({ ...EMPTY_GUIDE, ...read<Partial<GuideState>>(STORAGE_GUIDE, {}) });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) write(STORAGE_SAVED, savedIds);
  }, [savedIds, loaded]);

  useEffect(() => {
    if (loaded) write(STORAGE_GUIDE, guide);
  }, [guide, loaded]);

  // Opening any scholarship completes the "open" step.
  if (loaded && selectedScholarship && !guide.openedScholarship) {
    setGuide({ ...guide, openedScholarship: true });
  }

  const applications = guide.applications || {};
  const getApplication = useCallback(
    (id: string): ApplicationEntry =>
      (guide.applications || {})[id] || { stage: "Planning", notes: "", referees: "", result: "", updatedAt: "" },
    [guide.applications]
  );
  const updateApplication = useCallback((id: string, changes: Partial<ApplicationEntry>) => {
    setGuide((g) => {
      const current = (g.applications || {})[id] || { stage: "Planning", notes: "", referees: "", result: "", updatedAt: "" };
      return {
        ...g,
        applications: {
          ...(g.applications || {}),
          [id]: { ...current, ...changes, updatedAt: new Date().toISOString() },
        },
      };
    });
  }, []);

  const toggleSavedScholarship = useCallback((id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  const isSavedScholarship = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const markStep = useCallback((step: "profile" | "supervisor") => {
    setGuide((g) =>
      step === "profile"
        ? g.profileConfirmed
          ? g
          : { ...g, profileConfirmed: true }
        : g.searchedSupervisors
        ? g
        : { ...g, searchedSupervisors: true }
    );
  }, []);

  const steps = useMemo(
    () => [
      { id: "profile" as const, done: guide.profileConfirmed },
      { id: "open" as const, done: guide.openedScholarship },
      { id: "save" as const, done: savedIds.length > 0 },
      { id: "supervisor" as const, done: guide.searchedSupervisors },
      { id: "outreach" as const, done: contacts.length > 0 },
    ],
    [guide, savedIds.length, contacts.length]
  );
  const completedCount = steps.filter((s) => s.done).length;

  const value: GuideContextType = {
    savedIds,
    isSavedScholarship,
    toggleSavedScholarship,
    steps,
    completedCount,
    isGuideVisible: loaded && !guide.dismissed && completedCount < steps.length,
    dismissGuide: () => setGuide((g) => ({ ...g, dismissed: true })),
    reopenGuide: () => setGuide((g) => ({ ...g, dismissed: false })),
    markStep,
    isProfileOpen,
    setIsProfileOpen,
    guideState: guide,
    isQuickStartDismissed: !!guide.quickStartDismissed,
    dismissQuickStart: () => setGuide((g) => ({ ...g, quickStartDismissed: true })),
    applications,
    getApplication,
    updateApplication,
    replaceGuide: (ids: string[], g: Partial<GuideState>) => {
      setSavedIds(Array.isArray(ids) ? ids : []);
      setGuide({ ...EMPTY_GUIDE, ...g });
    },
  };

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export function useGuide(): GuideContextType {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuide must be used within GuideProvider");
  return ctx;
}
