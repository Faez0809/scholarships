/* eslint-disable @next/next/no-img-element -- local preview of a picture the user chose */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X, Cloud, CloudOff } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import { btn, useDialog } from "./ui";
import { Avatar } from "./Avatar";
import { PasswordInput } from "./PasswordInput";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // what we accept from the device; the upload itself is small
const OUTPUT_SIZE = 320;
const PREVIEW = 224;

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

/** "Your account": profile picture, password and sign out. */
export const AccountDialog: React.FC = () => {
  const { isAccountOpen, setIsAccountOpen, session, email, avatarUrl, removeAvatar, updatePassword, signOut, status } = useAccount();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(isAccountOpen, ref);
  const fileRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved" | "unchanged">("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAccountOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !picked && setIsAccountOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAccountOpen, setIsAccountOpen, picked]);

  if (!isAccountOpen || !session) return null;

  const close = () => {
    setIsAccountOpen(false);
    setPicked(null);
    setNotice(null);
    setNewPassword("");
    setPwState("idle");
    setPwError(null);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) {
      setNotice("Please choose a JPG, PNG or WebP picture.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setNotice("That picture is larger than 8 MB. Please choose a smaller one.");
      return;
    }
    setNotice(null);
    setPicked(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <div className="st-backdrop absolute inset-0 bg-black/40" onClick={() => !picked && close()} />
      <div ref={ref} className="st-dialog relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:pb-5">
        <div className="flex items-center justify-between">
          <h2 id="account-title" className="font-serif text-lg font-semibold text-stone-900">
            Your account
          </h2>
          <button type="button" onClick={close} className="rounded-md p-1 text-stone-500 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {picked ? (
          <AvatarCropper
            src={picked}
            onCancel={() => {
              URL.revokeObjectURL(picked);
              setPicked(null);
            }}
            onDone={(msg) => {
              URL.revokeObjectURL(picked);
              setPicked(null);
              setNotice(msg);
            }}
          />
        ) : (
          <>
            <div className="mt-6 flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                aria-label={avatarUrl ? "Change profile picture" : "Add a profile picture"}
              >
                <Avatar url={avatarUrl} email={email} size={96} />
                <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-white">
                  <Camera className="h-4 w-4" />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
              <p className="mt-3 max-w-full truncate text-sm font-medium text-stone-900">{email}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                {status === "unavailable" || status === "error" ? (
                  <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {status === "unavailable" || status === "error" ? "Saved in this browser only" : "Profile and shortlist saved to your account"}
              </p>
              <div className="mt-3 flex gap-4 text-sm">
                <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-blue-800 hover:underline">
                  {avatarUrl ? "Change picture" : "Add a picture"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={async () => setNotice((await removeAvatar()) || "Picture removed.")}
                    className="text-stone-500 hover:text-stone-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              {notice && (
                <p className="mt-2 text-sm text-stone-600" role="status">
                  {notice}
                </p>
              )}
            </div>

            <form
              className="mt-7 border-t border-stone-100 pt-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setPwError(null);
                setPwState("saving");
                const { error: err, unchanged } = await updatePassword(newPassword);
                if (err) {
                  setPwError(err);
                  setPwState("idle");
                } else {
                  setPwState(unchanged ? "unchanged" : "saved");
                  setNewPassword("");
                }
              }}
            >
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-800">Change password</span>
                <PasswordInput
                  autoComplete="new-password"
                  inputClassName={inputClass}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (pwState === "saved" || pwState === "unchanged") setPwState("idle");
                  }}
                  placeholder="New password (at least 6 characters)"
                />
              </label>
              {pwError && <p className="mt-2 text-sm text-red-700">{pwError}</p>}
              {(pwState === "saved" || pwState === "unchanged") && (
                <p className="mt-2 text-sm text-emerald-800" role="status">
                  {pwState === "saved" ? "Password updated." : "That's already your password, so nothing changed."}
                </p>
              )}
              <button type="submit" disabled={!newPassword || pwState === "saving"} className={`${btn.secondary} mt-3 w-full`}>
                {pwState === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>

            <button
              type="button"
              onClick={async () => {
                close();
                await signOut();
              }}
              className="mt-6 w-full rounded-lg py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/** Drag to position and zoom, then save a small square image shown as a circle. */
const AvatarCropper: React.FC<{ src: string; onCancel: () => void; onDone: (message: string) => void }> = ({ src, onCancel, onDone }) => {
  const { uploadAvatar } = useAccount();
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Scale so the shorter side fills the circle at zoom 1.
  const base = natural ? PREVIEW / Math.min(natural.w, natural.h) : 1;
  const scale = base * zoom;
  const dispW = natural ? natural.w * scale : PREVIEW;
  const dispH = natural ? natural.h * scale : PREVIEW;
  const clamp = (o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(PREVIEW - dispW, o.x)),
    y: Math.min(0, Math.max(PREVIEW - dispH, o.y)),
  });
  const pos = clamp(offset);

  const save = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    setSaving(true);
    setError(null);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Your browser couldn't prepare the picture.");
      setSaving(false);
      return;
    }
    const sx = -pos.x / scale;
    const sy = -pos.y / scale;
    const side = PREVIEW / scale;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob) {
      setError("Your browser couldn't prepare the picture.");
      setSaving(false);
      return;
    }
    const err = await uploadAvatar(blob);
    setSaving(false);
    if (err) setError(err);
    else onDone("Picture updated.");
  };

  return (
    <div className="mt-5">
      <p className="text-center text-sm text-stone-600">Drag to position. Use the slider to zoom.</p>
      <div
        className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200"
        style={{ width: PREVIEW, height: PREVIEW, cursor: "grab" }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setOffset(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Preview of your new picture"
          draggable={false}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            setNatural({ w, h });
            const b = PREVIEW / Math.min(w, h);
            setOffset({ x: (PREVIEW - w * b) / 2, y: (PREVIEW - h * b) / 2 });
          }}
          style={{ position: "absolute", left: pos.x, top: pos.y, width: dispW, height: dispH, maxWidth: "none" }}
        />
      </div>
      <label className="mx-auto mt-4 block max-w-[224px]">
        <span className="sr-only">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            const z = Number(e.target.value);
            // Zoom around the centre of the circle.
            const c = PREVIEW / 2;
            const ratio = z / zoom;
            setOffset(clamp({ x: c - (c - pos.x) * ratio, y: c - (c - pos.y) * ratio }));
            setZoom(z);
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-stone-900"
        />
      </label>
      {error && <p className="mt-3 text-center text-sm text-red-700">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onCancel} className={`${btn.secondary} flex-1`}>
          Cancel
        </button>
        <button type="button" onClick={save} disabled={saving || !natural} className={`${btn.primary} flex-1`}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save picture
        </button>
      </div>
    </div>
  );
};
