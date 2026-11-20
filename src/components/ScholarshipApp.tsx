"use client";

import React from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { AppHeader, MobileTabBar } from "./AppHeader";
import { BrowseView } from "./BrowseView";
import { SupervisorFinder } from "./SupervisorFinder";
import { OutreachTracker } from "./OutreachTracker";
import { ScholarshipDrawer } from "./ScholarshipDrawer";
import { AdminModal } from "./AdminModal";
import { PasscodeModal } from "./PasscodeModal";

export const ScholarshipApp: React.FC = () => {
  const { activeView, syncStatus, refreshFromCloud } = useScholarship();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <AppHeader />

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        {activeView === "scholarships" && <BrowseView />}
        {activeView === "supervisors" && <SupervisorFinder />}
        {activeView === "outreach" && <OutreachTracker />}
      </main>

      <footer className="hidden border-t border-zinc-200 bg-white md:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-zinc-500">
          <p>
            <span className="font-medium text-zinc-700">ScholarTrack</span> · Data from official program pages and
            OpenAlex. Always confirm details before applying.
          </p>
          <button type="button" onClick={() => refreshFromCloud()} className="hover:text-zinc-800">
            {syncStatus === "syncing"
              ? "Updating…"
              : syncStatus === "offline"
              ? "Offline · showing saved copy"
              : syncStatus === "fallback"
              ? "Showing saved copy · refresh"
              : "Catalog up to date · refresh"}
          </button>
        </div>
      </footer>

      <MobileTabBar />
      <ScholarshipDrawer />
      <AdminModal />
      <PasscodeModal />
    </div>
  );
};
