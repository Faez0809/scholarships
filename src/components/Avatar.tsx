/* eslint-disable @next/next/no-img-element -- small user-uploaded picture from Supabase Storage */
"use client";

import React, { useState } from "react";

/** Round profile picture, falling back to the first letter of the email. */
export const Avatar: React.FC<{ url: string | null; email: string | null; size?: number }> = ({ url, email, size = 32 }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const letter = (email || "?").slice(0, 1).toUpperCase();
  const style = { width: size, height: size };
  if (url && failedUrl !== url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={style}
        onError={() => setFailedUrl(url)}
        className="shrink-0 rounded-full object-cover ring-1 ring-stone-200"
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: Math.round(size * 0.4) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-stone-800 font-semibold text-white"
      aria-hidden="true"
    >
      {letter}
    </span>
  );
};
