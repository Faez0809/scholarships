"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Password field with a show/hide button, so people can check what they typed. */
export const PasswordInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { inputClassName?: string }
> = ({ inputClassName, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={`${inputClassName || ""} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
