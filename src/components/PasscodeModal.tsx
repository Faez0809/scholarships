"use client";

import React, { useState, useEffect, useRef } from "react";
import { useScholarship } from "../context/ScholarshipContext";
import { Lock, X, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";

export const PasscodeModal: React.FC = () => {
  const { isPasscodeModalOpen, setIsPasscodeModalOpen, unlockAdmin } =
    useScholarship();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPasscodeModalOpen) {
      setPin("");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isPasscodeModalOpen]);

  if (!isPasscodeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(pin);
    if (!success) {
      setError(true);
      setPin("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsPasscodeModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <KeyRound className="h-5 w-5" />
          </div>
          <button
            onClick={() => setIsPasscodeModalOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-zinc-900">
            Admin Mode Verification
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
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
                className={`w-full rounded-xl border py-2.5 px-4 text-center font-mono text-lg tracking-widest text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition ${
                  error
                    ? "border-red-400 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400"
                    : "border-zinc-200 bg-zinc-50/70 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
            </div>

            {error && (
              <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Incorrect passcode. Default PIN is 1234.</span>
              </p>
            )}

            <p className="mt-2 text-center text-[11px] text-zinc-400">
              Default passcode: <code className="font-mono font-bold text-zinc-600">1234</code>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPasscodeModalOpen(false)}
              className="w-1/2 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
