"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  FundingType,
  PillFilter,
  Region,
  Scholarship,
  SortOption,
  UserProfile,
} from "../types/scholarship";
import { SEED_SCHOLARSHIPS } from "../data/seedScholarships";
import {
  calculateDaysRemaining,
  checkEligibility,
  getSavingsRange,
} from "../utils/scholarshipUtils";

export type SyncStatus = "idle" | "syncing" | "synced" | "fallback" | "offline";

interface Stats {
  total: number;
  eligibleCount: number;
  closingSoonCount: number;
  highSavingsCount: number;
  regionCounts: Record<string, number>;
  fundingCounts: Record<string, number>;
}

interface ScholarshipContextType {
  scholarships: Scholarship[];
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfileField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  resetProfile: () => void;
  activePill: PillFilter;
  setActivePill: (pill: PillFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  isAdmin: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  selectedScholarship: Scholarship | null;
  setSelectedScholarship: (scholarship: Scholarship | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingScholarship: Scholarship | null;
  setEditingScholarship: (scholarship: Scholarship | null) => void;
  isPasscodeModalOpen: boolean;
  setIsPasscodeModalOpen: (open: boolean) => void;
  documentChecklist: Record<string, boolean>;
  toggleDocumentCheck: (scholarshipId: string, docName: string) => void;
  addScholarship: (
    data: Omit<Scholarship, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateScholarship: (id: string, updated: Partial<Scholarship>) => Promise<void>;
  deleteScholarship: (id: string) => Promise<void>;
  resetToSeedData: () => Promise<void>;
  stats: Stats;
  syncStatus: SyncStatus;
  refreshFromCloud: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  targetDegree: "Both",
  majorCategory: "All",
  cgpa: 3.5,
  ielts: 7.0,
  mediumPreference: "English Only",
  minSavingsDesired: 300,
  onlyEligible: false,
  selectedRegion: "All",
  fundingTypePreference: "All",
  supervisorPreference: "All",
};

const STORAGE_KEY_SCHOLARSHIPS = "scholar_track_v2_scholarships";
const STORAGE_KEY_PROFILE = "scholar_track_v2_profile";
const STORAGE_KEY_ADMIN = "scholar_track_v2_is_admin";
const STORAGE_KEY_PIN = "scholar_track_v2_admin_pin";
const STORAGE_KEY_DOCS = "scholar_track_v2_docs";

const ScholarshipContext = createContext<ScholarshipContextType | undefined>(
  undefined
);

export function ScholarshipProvider({ children }: { children: ReactNode }) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activePill, setActivePill] = useState<PillFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("deadline");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("1234");
  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] =
    useState<Scholarship | null>(null);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [documentChecklist, setDocumentChecklist] = useState<
    Record<string, boolean>
  >({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Fetch latest data from Supabase backend
  const refreshFromCloud = useCallback(async () => {
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/scholarships", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const json = await res.json();
        if (
          json.scholarships &&
          Array.isArray(json.scholarships) &&
          json.scholarships.length > 0
        ) {
          setScholarships(json.scholarships);
          localStorage.setItem(
            STORAGE_KEY_SCHOLARSHIPS,
            JSON.stringify(json.scholarships)
          );
          setSyncStatus(json.source === "fallback" ? "fallback" : "synced");
          return;
        }
      }
      setSyncStatus("fallback");
    } catch (e) {
      console.warn("Could not sync with Supabase cloud, operating offline:", e);
      setSyncStatus("offline");
    }
  }, []);

  // Initialize from LocalStorage immediately for instant UI load
  useEffect(() => {
    try {
      // 1. Scholarships
      const savedScholarships =
        localStorage.getItem(STORAGE_KEY_SCHOLARSHIPS) ||
        localStorage.getItem("scholar_track_v1_scholarships");

      if (savedScholarships) {
        const parsed: any[] = JSON.parse(savedScholarships);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated: Scholarship[] = parsed.map((item) => {
            const seedMatch = SEED_SCHOLARSHIPS.find((s) => s.id === item.id);
            return {
              ...item,
              region: item.region || seedMatch?.region || "Global",
              fundingType:
                item.fundingType || seedMatch?.fundingType || "University Direct",
              supervisorRequired:
                item.supervisorRequired ||
                seedMatch?.supervisorRequired ||
                "Not Required (Central Admission)",
              partnerUniversities:
                item.partnerUniversities || seedMatch?.partnerUniversities,
              supervisorFundingGuide:
                item.supervisorFundingGuide || seedMatch?.supervisorFundingGuide,
            };
          });

          // Merge any newly introduced seed scholarships that aren't present yet
          const existingIds = new Set(migrated.map((m) => m.id));
          for (const seed of SEED_SCHOLARSHIPS) {
            if (!existingIds.has(seed.id)) {
              migrated.push(seed);
            }
          }

          setScholarships(migrated);
          localStorage.setItem(
            STORAGE_KEY_SCHOLARSHIPS,
            JSON.stringify(migrated)
          );
        } else {
          setScholarships(SEED_SCHOLARSHIPS);
          localStorage.setItem(
            STORAGE_KEY_SCHOLARSHIPS,
            JSON.stringify(SEED_SCHOLARSHIPS)
          );
        }
      } else {
        setScholarships(SEED_SCHOLARSHIPS);
        localStorage.setItem(
          STORAGE_KEY_SCHOLARSHIPS,
          JSON.stringify(SEED_SCHOLARSHIPS)
        );
      }

      // 2. Profile
      const savedProfile =
        localStorage.getItem(STORAGE_KEY_PROFILE) ||
        localStorage.getItem("scholar_track_v1_profile");
      if (savedProfile) {
        const parsedProf = JSON.parse(savedProfile);
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsedProf,
        });
      }

      // 3. Admin status & PIN
      const savedAdmin =
        localStorage.getItem(STORAGE_KEY_ADMIN) ||
        localStorage.getItem("scholar_track_v1_is_admin");
      if (savedAdmin === "true") {
        setIsAdmin(true);
      }
      const savedPin = localStorage.getItem(STORAGE_KEY_PIN);
      if (savedPin) {
        setAdminPin(savedPin);
      }

      // 4. Document checklist
      const savedDocs =
        localStorage.getItem(STORAGE_KEY_DOCS) ||
        localStorage.getItem("scholar_track_v1_docs");
      if (savedDocs) {
        setDocumentChecklist(JSON.parse(savedDocs));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
      setScholarships(SEED_SCHOLARSHIPS);
    } finally {
      setIsInitialized(true);
      // Trigger live Supabase cloud sync in background
      refreshFromCloud();
    }
  }, [refreshFromCloud]);

  // Sync scholarships to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY_SCHOLARSHIPS,
        JSON.stringify(scholarships)
      );
    } catch (e) {
      console.error("Failed to persist scholarships:", e);
    }
  }, [scholarships, isInitialized]);

  // Sync profile to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to persist profile:", e);
    }
  }, [profile, isInitialized]);

  // Sync document checklist to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY_DOCS,
        JSON.stringify(documentChecklist)
      );
    } catch (e) {
      console.error("Failed to persist document checklist:", e);
    }
  }, [documentChecklist, isInitialized]);

  // Keep selectedScholarship updated if it was edited
  useEffect(() => {
    if (selectedScholarship) {
      const fresh = scholarships.find((s) => s.id === selectedScholarship.id);
      if (fresh) {
        setSelectedScholarship(fresh);
      } else {
        setSelectedScholarship(null);
      }
    }
  }, [scholarships]);

  const updateProfileField = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  const unlockAdmin = (pin: string): boolean => {
    if (pin.trim() === "1234") {
      setIsAdmin(true);
      setAdminPin(pin.trim());
      localStorage.setItem(STORAGE_KEY_ADMIN, "true");
      localStorage.setItem(STORAGE_KEY_PIN, pin.trim());
      setIsPasscodeModalOpen(false);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN);
    localStorage.removeItem(STORAGE_KEY_PIN);
  };

  const toggleDocumentCheck = (scholarshipId: string, docName: string) => {
    const key = `${scholarshipId}::${docName}`;
    setDocumentChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addScholarship = async (
    data: Omit<Scholarship, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = `scholarship-${Date.now()}`;
    const now = new Date().toISOString();
    const newScholarship: Scholarship = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic local state update
    setScholarships((prev) => [newScholarship, ...prev]);
    setIsAddModalOpen(false);

    // Sync to Supabase cloud
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/scholarships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin || "1234",
        },
        body: JSON.stringify(newScholarship),
      });

      if (res.ok) {
        setSyncStatus("synced");
      } else {
        console.warn("Could not save to Supabase cloud (saved locally).");
        setSyncStatus("fallback");
      }
    } catch (err) {
      console.warn("Network error during Supabase add (saved locally):", err);
      setSyncStatus("offline");
    }
  };

  const updateScholarship = async (
    id: string,
    updated: Partial<Scholarship>
  ) => {
    const now = new Date().toISOString();
    let updatedRecord: Scholarship | undefined;

    // Optimistic local state update
    setScholarships((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedRecord = { ...s, ...updated, updatedAt: now };
          return updatedRecord;
        }
        return s;
      })
    );
    setEditingScholarship(null);

    // Sync to Supabase cloud
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/scholarships", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin || "1234",
        },
        body: JSON.stringify({ id, ...updated }),
      });

      if (res.ok) {
        setSyncStatus("synced");
      } else {
        console.warn("Could not update in Supabase cloud (saved locally).");
        setSyncStatus("fallback");
      }
    } catch (err) {
      console.warn("Network error during Supabase update (saved locally):", err);
      setSyncStatus("offline");
    }
  };

  const deleteScholarship = async (id: string) => {
    // Optimistic local state update
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    if (selectedScholarship?.id === id) {
      setSelectedScholarship(null);
    }

    // Sync to Supabase cloud
    try {
      setSyncStatus("syncing");
      const res = await fetch(
        `/api/scholarships?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            "x-admin-pin": adminPin || "1234",
          },
        }
      );

      if (res.ok) {
        setSyncStatus("synced");
      } else {
        console.warn("Could not delete from Supabase cloud (deleted locally).");
        setSyncStatus("fallback");
      }
    } catch (err) {
      console.warn("Network error during Supabase delete (deleted locally):", err);
      setSyncStatus("offline");
    }
  };

  const resetToSeedData = async () => {
    setScholarships(SEED_SCHOLARSHIPS);
    localStorage.setItem(
      STORAGE_KEY_SCHOLARSHIPS,
      JSON.stringify(SEED_SCHOLARSHIPS)
    );

    // Sync to Supabase cloud
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/scholarships?action=reset", {
        method: "POST",
        headers: {
          "x-admin-pin": adminPin || "1234",
        },
      });

      if (res.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("fallback");
      }
    } catch (err) {
      console.warn("Network error during Supabase reset (reset locally):", err);
      setSyncStatus("offline");
    }
  };

  // Quick Stats & Breakdown Counts
  const stats = useMemo(() => {
    const total = scholarships.length;
    let eligibleCount = 0;
    let closingSoonCount = 0;
    let highSavingsCount = 0;

    const regionCounts: Record<string, number> = {
      All: total,
      Europe: 0,
      Asia: 0,
      Americas: 0,
      Oceania: 0,
      "Middle East": 0,
      Global: 0,
    };

    const fundingCounts: Record<string, number> = {
      All: total,
      "Gov / Multi-Uni": 0,
      "University Direct": 0,
      "Supervisor / RA-TA": 0,
    };

    for (const s of scholarships) {
      if (checkEligibility(s, profile).isEligible) {
        eligibleCount++;
      }
      const { isClosingSoon } = calculateDaysRemaining(s.deadline);
      if (isClosingSoon) {
        closingSoonCount++;
      }
      if (getSavingsRange(s).maxSavings > 300) {
        highSavingsCount++;
      }

      if (s.region && regionCounts[s.region] !== undefined) {
        regionCounts[s.region]++;
      }
      if (s.fundingType && fundingCounts[s.fundingType] !== undefined) {
        fundingCounts[s.fundingType]++;
      }
    }

    return {
      total,
      eligibleCount,
      closingSoonCount,
      highSavingsCount,
      regionCounts,
      fundingCounts,
    };
  }, [scholarships, profile]);

  return (
    <ScholarshipContext.Provider
      value={{
        scholarships,
        profile,
        setProfile,
        updateProfileField,
        resetProfile,
        activePill,
        setActivePill,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        isAdmin,
        unlockAdmin,
        lockAdmin,
        selectedScholarship,
        setSelectedScholarship,
        isAddModalOpen,
        setIsAddModalOpen,
        editingScholarship,
        setEditingScholarship,
        isPasscodeModalOpen,
        setIsPasscodeModalOpen,
        documentChecklist,
        toggleDocumentCheck,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        resetToSeedData,
        stats,
        syncStatus,
        refreshFromCloud,
      }}
    >
      {children}
    </ScholarshipContext.Provider>
  );
}

export function useScholarship() {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error("useScholarship must be used within a ScholarshipProvider");
  }
  return context;
}
