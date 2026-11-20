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

export const OUTREACH_STATUSES = [
  "Drafting",
  "Email Sent",
  "Follow-up Due",
  "Replied / Interview",
  "Declined",
] as const;

export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export interface OutreachEvent {
  at: string; // ISO timestamp
  status: OutreachStatus;
  note?: string;
}

export interface OutreachContact {
  id: string;
  name: string;
  institution: string;
  email: string;
  profileUrl: string;
  researchTopic: string;
  /** A recent paper to mention in the email. */
  paperTitle: string;
  status: OutreachStatus;
  notes: string;
  /** YYYY-MM-DD of the last email sent. */
  lastContactedOn: string;
  /** YYYY-MM-DD to follow up by. */
  followUpOn: string;
  hIndex: number | null;
  openAlexId: string | null;
  history: OutreachEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SenderDetails {
  fullName: string;
  currentRole: string; // e.g. "final-year BSc student in CSE at XYZ University"
  researchInterest: string;
  highlights: string; // one or two achievements
}

export type NewContact = Partial<Omit<OutreachContact, "id" | "createdAt" | "updatedAt" | "history">> & {
  name: string;
  institution: string;
};

interface OutreachContextType {
  contacts: OutreachContact[];
  sender: SenderDetails;
  setSender: (next: SenderDetails) => void;
  addContact: (data: NewContact) => OutreachContact;
  updateContact: (id: string, changes: Partial<OutreachContact>) => void;
  setStatus: (id: string, status: OutreachStatus, note?: string) => void;
  removeContact: (id: string) => void;
  isSaved: (openAlexId: string | null | undefined, name?: string, institution?: string) => boolean;
  isLoaded: boolean;
}

const STORAGE_CONTACTS = "scholar_track_v2_outreach_contacts";
const STORAGE_SENDER = "scholar_track_v2_outreach_sender";

const EMPTY_SENDER: SenderDetails = {
  fullName: "",
  currentRole: "",
  researchInterest: "",
  highlights: "",
};

const FOLLOW_UP_DAYS = 10;

export function todayISODate(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDaysISO(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() + days);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** True when an email was sent and the follow-up date has arrived without a reply. */
export function isFollowUpOverdue(c: OutreachContact): boolean {
  if (c.status !== "Email Sent" && c.status !== "Follow-up Due") return false;
  if (!c.followUpOn) return false;
  return c.followUpOn <= todayISODate();
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the tracker still works for this visit.
  }
}

const OutreachContext = createContext<OutreachContextType | undefined>(undefined);

export function OutreachProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [sender, setSenderState] = useState<SenderDetails>(EMPTY_SENDER);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = readStorage<OutreachContact[]>(STORAGE_CONTACTS, []);
    setContacts(Array.isArray(stored) ? stored : []);
    setSenderState({ ...EMPTY_SENDER, ...readStorage<Partial<SenderDetails>>(STORAGE_SENDER, {}) });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) writeStorage(STORAGE_CONTACTS, contacts);
  }, [contacts, isLoaded]);

  const setSender = useCallback((next: SenderDetails) => {
    setSenderState(next);
    writeStorage(STORAGE_SENDER, next);
  }, []);

  const addContact = useCallback((data: NewContact): OutreachContact => {
    const now = new Date().toISOString();
    const status = data.status || "Drafting";
    const contact: OutreachContact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      institution: data.institution.trim(),
      email: data.email?.trim() || "",
      profileUrl: data.profileUrl?.trim() || "",
      researchTopic: data.researchTopic?.trim() || "",
      paperTitle: data.paperTitle?.trim() || "",
      status,
      notes: data.notes || "",
      lastContactedOn: data.lastContactedOn || "",
      followUpOn: data.followUpOn || "",
      hIndex: data.hIndex ?? null,
      openAlexId: data.openAlexId ?? null,
      history: [{ at: now, status, note: "Added to tracker" }],
      createdAt: now,
      updatedAt: now,
    };
    setContacts((prev) => [contact, ...prev]);
    return contact;
  }, []);

  const updateContact = useCallback((id: string, changes: Partial<OutreachContact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const setStatus = useCallback((id: string, status: OutreachStatus, note?: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.status === status) return c;
        const now = new Date().toISOString();
        const extra: Partial<OutreachContact> = {};
        if (status === "Email Sent") {
          const today = todayISODate();
          extra.lastContactedOn = today;
          extra.followUpOn = addDaysISO(today, FOLLOW_UP_DAYS);
        }
        if (status === "Replied / Interview" || status === "Declined") {
          extra.followUpOn = "";
        }
        return {
          ...c,
          ...extra,
          status,
          updatedAt: now,
          history: [...c.history, { at: now, status, note }],
        };
      })
    );
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const isSaved = useCallback(
    (openAlexId: string | null | undefined, name?: string, institution?: string) =>
      contacts.some(
        (c) =>
          (openAlexId && c.openAlexId === openAlexId) ||
          (!!name &&
            c.name.toLowerCase() === name.toLowerCase() &&
            c.institution.toLowerCase() === (institution || "").toLowerCase())
      ),
    [contacts]
  );

  const value = useMemo(
    () => ({
      contacts,
      sender,
      setSender,
      addContact,
      updateContact,
      setStatus,
      removeContact,
      isSaved,
      isLoaded,
    }),
    [contacts, sender, setSender, addContact, updateContact, setStatus, removeContact, isSaved, isLoaded]
  );

  return <OutreachContext.Provider value={value}>{children}</OutreachContext.Provider>;
}

export function useOutreach(): OutreachContextType {
  const ctx = useContext(OutreachContext);
  if (!ctx) throw new Error("useOutreach must be used within OutreachProvider");
  return ctx;
}
