"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Users,
  Landmark,
  ClipboardList,
  ShieldCheck,
  Plus,
  RefreshCw,
  RotateCcw,
  LogOut,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { AppView, useScholarship } from "../context/ScholarshipContext";
import { useGuide } from "../context/GuideContext";
import { isFollowUpOverdue, useOutreach } from "../context/OutreachContext";
import { AccountButton } from "./AuthDialog";

export const NAV_ITEMS: { id: AppView; label: string; short: string; Icon: React.ElementType }[] = [
  { id: "scholarships", label: "Scholarships", short: "Browse", Icon: GraduationCap },
  { id: "universities", label: "Universities", short: "Universities", Icon: Landmark },
  { id: "supervisors", label: "Supervisors", short: "Supervisors", Icon: Users },
  { id: "outreach", label: "My applications", short: "Applied", Icon: ClipboardList },
];

export const AppHeader: React.FC = () => {
  const { activeView, setActiveView } = useScholarship();
  const { setIsProfileOpen } = useGuide();
  const { contacts } = useOutreach();
  const due = contacts.filter(isFollowUpOverdue).length;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setActiveView("scholarships")}
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="ScholarTrack home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-stone-900">ScholarTrack</span>
        </button>

        <nav aria-label="Main" className="hidden h-full md:block">
          <ul className="flex h-full items-stretch gap-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeView === id;
              return (
                <li key={id} className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveView(id)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-2 px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                      active ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{label}</span>
                    {id === "outreach" && due > 0 && (
                      <span className="rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-800">
                        {due}
                      </span>
                    )}
                    {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-700" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AdminMenu />
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 md:inline-flex"
          >
            <UserRound className="h-4 w-4" /> Profile
          </button>
          <AccountButton />
        </div>
      </div>
    </header>
  );
};

/* Bottom tab bar for phones */
export const MobileTabBar: React.FC = () => {
  const { activeView, setActiveView } = useScholarship();
  const { setIsProfileOpen, isProfileOpen } = useGuide();
  const { contacts } = useOutreach();
  const due = contacts.filter(isFollowUpOverdue).length;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ id, short, Icon }) => {
          const active = activeView === id && !isProfileOpen;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setActiveView(id);
                }}
                aria-current={active ? "page" : undefined}
                className={`relative flex w-full flex-col items-center gap-0.5 pb-2 pt-2.5 text-[11px] font-medium ${
                  active ? "text-blue-800" : "text-stone-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {short}
                {id === "outreach" && due > 0 && (
                  <span className="absolute right-[calc(50%-18px)] top-1.5 h-2 w-2 rounded-full bg-amber-500" aria-label={`${due} follow-ups due`} />
                )}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => {
              setActiveView("scholarships");
              setIsProfileOpen(true);
            }}
            aria-pressed={isProfileOpen}
            className={`flex w-full flex-col items-center gap-0.5 pb-2 pt-2.5 text-[11px] font-medium ${
              isProfileOpen ? "text-blue-800" : "text-stone-500"
            }`}
          >
            <UserRound className="h-5 w-5" />
            Profile
          </button>
        </li>
      </ul>
    </nav>
  );
};

/* Admin controls grouped in one menu */
const AdminMenu: React.FC = () => {
  const {
    isAdmin,
    lockAdmin,
    setIsAddModalOpen,
    setEditingScholarship,
    resetToSeedData,
    syncNewPrograms,
  } = useScholarship();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 4500);
  };

  // Visitors reach admin mode from the footer; the header only shows the menu once unlocked.
  if (!isAdmin) return null;

  const item =
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:bg-stone-100 disabled:opacity-60";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Admin
        <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-1.5 w-60 rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              setEditingScholarship(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 text-stone-500" /> Add a scholarship
          </button>
          <button
            role="menuitem"
            type="button"
            disabled={busy}
            className={item}
            onClick={async () => {
              setBusy(true);
              const r = await syncNewPrograms();
              setBusy(false);
              setOpen(false);
              if (!r.ok) flash(r.error || "Could not sync programs.");
              else if (r.added === 0 && r.updated === 0) flash("Everything is up to date.");
              else flash(`${r.added} added, ${r.updated} deadlines refreshed.`);
            }}
          >
            <RefreshCw className={`h-4 w-4 text-stone-500 ${busy ? "animate-spin" : ""}`} /> Sync built-in programs
          </button>
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              if (
                window.confirm(
                  "Replace the whole catalog with the built-in programs? Custom entries and edits will be permanently removed."
                )
              )
                resetToSeedData();
            }}
          >
            <RotateCcw className="h-4 w-4 text-stone-500" /> Reset catalog
          </button>
          <div className="my-1 border-t border-stone-100" />
          <button
            role="menuitem"
            type="button"
            className={item}
            onClick={() => {
              setOpen(false);
              lockAdmin();
            }}
          >
            <LogOut className="h-4 w-4 text-stone-500" /> Leave admin mode
          </button>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-lg md:bottom-6 md:right-6 md:left-auto md:mx-0"
        >
          {notice}
        </div>
      )}
    </div>
  );
};
