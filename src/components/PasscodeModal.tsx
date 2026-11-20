"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { useDialog } from "./ui";
import { X, KeyRound, AlertCircle } from "lucide-react";

export const PasscodeModal: React.FC = () => {
  const { isPasscodeModalOpen, setIsPasscodeModalOpen, unlockAdmin } =
    useScholarship();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [wasOpen, setWasOpen] = useState(isPasscodeModalOpen);
  if (isPasscodeModalOpen !== wasOpen) {
    setWasOpen(isPasscodeModalOpen);
    if (isPasscodeModalOpen) {
      setPin("");
      setError(false);
    }
  }

  useEffect(() => {
    if (!isPasscodeModalOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(t);
  }, [isPasscodeModalOpen]);

  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(isPasscodeModalOpen, dialogRef);

  if (!isPasscodeModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecking) return;
    setIsChecking(true);
    const success = await unlockAdmin(pin);
    setIsChecking(false);
    if (!success) {
      setError(true);
      setPin("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Admin passcode">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsPasscodeModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div ref={dialogRef} className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <button
            onClick={() => setIsPasscodeModalOpen(false)}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-stone-900">
            Admin Mode Verification
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Enter the admin passcode to unlock CRUD controls (Add, Edit, and Delete scholarships).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter PIN..."
                className={`w-full rounded-xl border py-2.5 px-4 text-center font-mono text-lg tracking-widest text-stone-900 placeholder:text-stone-400 focus:outline-none transition ${
                  error
                    ? "border-red-400 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400"
                    : "border-stone-200 bg-stone-50/70 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                }`}
              />
            </div>

            {error && (
              <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Incorrect passcode. Please try again.</span>
              </p>
            )}

          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPasscodeModalOpen(false)}
              className="w-1/2 rounded-xl border border-stone-200 bg-white py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChecking || !pin.trim()}
              className="w-1/2 rounded-xl bg-blue-700 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isChecking ? "Checking..." : "Unlock Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
