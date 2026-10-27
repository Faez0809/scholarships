"use client";

import React from "react";
import { useScholarship } from "../context/ScholarshipContext";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Lock,
  Plus,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    stats,
    isAdmin,
    setIsPasscodeModalOpen,
    lockAdmin,
    setIsAddModalOpen,
    setEditingScholarship,
    searchQuery,
    setSearchQuery,
    resetToSeedData,
  } = useScholarship();

  const handleOpenAddModal = () => {
    setEditingScholarship(null);
    setIsAddModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-sm shadow-indigo-200 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-zinc-900">
                Scholar<span className="text-indigo-600">Track</span>
              </span>
              <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 sm:inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> v1.0
              </span>
            </div>
            <p className="hidden text-xs text-zinc-500 md:block">
              Fully Funded Master&apos;s & PhD Worldwide
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative mx-4 hidden max-w-md flex-1 md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarship, university, city, or field..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/70 py-1.5 pl-9 pr-4 text-sm text-zinc-900 transition placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Stats & Admin Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Stats Badges */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-1 text-xs font-medium text-zinc-700">
              <span className="font-semibold text-zinc-900">{stats.total}</span>
              <span>Total</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span className="font-semibold text-emerald-950">
                {stats.eligibleCount}
              </span>
              <span>Eligible</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-xs font-medium text-amber-800">
              <Clock className="h-3 w-3 text-amber-600" />
              <span className="font-semibold text-amber-950">
                {stats.closingSoonCount}
              </span>
              <span>Closing Soon</span>
            </div>
          </div>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          {/* Admin Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Admin Active
              </span>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                title="Add new scholarship"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Scholarship</span>
              </button>

              <button
                onClick={resetToSeedData}
                className="hidden rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 xl:flex items-center gap-1 text-xs"
                title="Reset to 6 Default Seed Scholarships"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Seed</span>
              </button>

              <button
                onClick={lockAdmin}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                title="Exit Admin Mode"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPasscodeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Admin Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar if screen is small */}
      <div className="border-t border-zinc-100 px-4 py-2 md:hidden">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, universities, cities..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/80 py-1.5 pl-9 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
