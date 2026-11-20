"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { FIELD_CATEGORY_LABELS, FieldCategoryValue, matchField } from "../utils/fieldMatch";

interface Option {
  key: string;
  /** Main line, e.g. "Electrical & Electronic Engineering" */
  name: string;
  /** Short form typed, shown before the name, e.g. "EEE" */
  abbr?: string;
  category: FieldCategoryValue | "All";
  categoryLabel: string;
}

const BROAD: Option[] = [
  { key: "all", name: "Any field", category: "All", categoryLabel: "Show every program" },
  ...(Object.keys(FIELD_CATEGORY_LABELS) as FieldCategoryValue[]).map((c) => ({
    key: `cat-${c}`,
    name: FIELD_CATEGORY_LABELS[c],
    category: c,
    categoryLabel: "Broad field",
  })),
];

/**
 * Type a department, a short form (CSE, EEE, IPE, BBA) or a topic, and pick the
 * suggestion. The chosen field filters the results.
 */
export const FieldPicker: React.FC<{
  category: string;
  text?: string;
  onChange: (category: string, text: string) => void;
}> = ({ category, text, onChange }) => {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const chosen = category && category !== "All" && category !== "All Fields" ? text || FIELD_CATEGORY_LABELS[category as FieldCategoryValue] || category : "";
  const [query, setQuery] = useState<string | null>(null); // null = not editing
  const [active, setActive] = useState(0);

  const editing = query !== null;
  const typed = (query || "").trim();

  const options: Option[] = useMemo(() => {
    if (!typed) return BROAD;
    return matchField(typed).map((m) => ({
      key: m.name,
      name: m.name,
      abbr: m.viaAbbr,
      category: m.category,
      categoryLabel: m.categoryLabel,
    }));
  }, [typed]);

  const noMatch = editing && typed.length > 0 && options.length === 0;
  const shown = noMatch ? BROAD.slice(1) : options;

  const choose = (o: Option) => {
    onChange(o.category, o.category === "All" ? "" : o.name);
    setQuery(null);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editing) {
      if (e.key === "ArrowDown") setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (e.key === "Escape") {
      // Close the list without closing the profile sheet
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setQuery(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="My field"
          aria-expanded={editing}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={editing && shown[active] ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          value={editing ? query : chosen}
          placeholder="Any field. Type e.g. CSE, EEE, BBA, robotics"
          onFocus={() => {
            setQuery("");
            setActive(0);
          }}
          onBlur={() => setTimeout(() => setQuery(null), 120)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
        />
        {(chosen || typed) && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (editing && typed) {
                setQuery("");
                inputRef.current?.focus();
              } else {
                onChange("All", "");
                setQuery(null);
              }
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            aria-label={editing && typed ? "Clear typed text" : "Reset to any field"}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {editing && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
          {noMatch && (
            <p className="border-b border-stone-100 px-3 py-2 text-xs text-stone-500">
              No match for &ldquo;{typed}&rdquo;. Pick the broad field closest to yours:
            </p>
          )}
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {shown.map((o, i) => (
              <li
                key={o.key}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-3 py-2 ${i === active ? "bg-stone-100" : ""}`}
              >
                <span className="block text-sm text-stone-900">
                  {o.abbr && <span className="font-semibold">{o.abbr} → </span>}
                  {o.name}
                </span>
                <span className="block text-xs text-stone-500">{o.categoryLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
