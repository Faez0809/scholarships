"use client";

import React, { useEffect } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { AppHeader, MobileTabBar } from "./AppHeader";
import { BrowseView } from "./BrowseView";
import { SupervisorFinder } from "./SupervisorFinder";
import { ApplicationsView } from "./ApplicationsView";
import { UniversitiesView } from "./UniversitiesView";
import { ScholarshipDrawer } from "./ScholarshipDrawer";
import { AdminModal } from "./AdminModal";
import { PasscodeModal } from "./PasscodeModal";
import { AuthDialog } from "./AuthDialog";
import { ProfilePanel } from "./ProfilePanel";

export const ScholarshipApp: React.FC = () => {
  const { activeView, isAdmin, setIsPasscodeModalOpen } = useScholarship();

  // Admin mode is reached by URL only (…/?admin), not from the public interface.
  useEffect(() => {
    if (!isAdmin && new URLSearchParams(window.location.search).has("admin")) {
      setIsPasscodeModalOpen(true);
    }
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <AppHeader />

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-6 sm:px-6 md:pb-12">
        {activeView === "scholarships" && <BrowseView />}
        {activeView === "universities" && <UniversitiesView />}
        {activeView === "supervisors" && <SupervisorFinder />}
        {activeView === "outreach" && <ApplicationsView />}
      </main>

      <footer className="border-t border-stone-200 bg-white pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl space-y-1.5 px-4 py-6 text-xs leading-relaxed text-stone-500 sm:px-6">
          <p>
            <span className="font-medium text-stone-700">ScholarTrack is free and never asks for payment.</span> Real
            scholarships never charge an application fee or ask for bank details. Always apply on the official website
            linked on each program.
          </p>
          <p>Data from official program pages, OpenAlex and Wikipedia. Each listing shows when it was last checked.</p>
        </div>
      </footer>

      <MobileTabBar />
      <ScholarshipDrawer />
      <ProfilePanel />
      <AdminModal />
      <PasscodeModal />
      <AuthDialog />
    </div>
  );
};
