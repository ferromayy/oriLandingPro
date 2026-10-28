"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function CoffeeCatalogFilter({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (options.length === 0) return null;

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-xs">
      <p
        id={labelId}
        className="font-mono text-xs uppercase tracking-widest text-gray-500"
      >
        {label}
      </p>
      <button
        type="button"
        aria-label={`${label}: ${value || "Todos"}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between border-b border-gray-900 pb-2 text-left text-sm text-gray-900"
      >
        <span>{value || "Todos"}</span>
        <span aria-hidden className="text-gray-500">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby={labelId}
          className="relative z-30 mt-2 max-h-64 w-full overflow-y-auto border border-gray-200 bg-white py-2 shadow-sm"
        >
          <FilterOption selected={value === ""} onSelect={() => choose("")}>
            Todos
          </FilterOption>
          {options.map((option) => (
            <FilterOption
              key={option}
              selected={value === option}
              onSelect={() => choose(option)}
            >
              {option}
            </FilterOption>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: string;
}) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
      >
        <span
          aria-hidden
          className={`h-3 w-3 shrink-0 rounded-full border ${
            selected ? "border-gray-900 bg-gray-900" : "border-gray-400"
          }`}
        />
        {children}
      </button>
    </li>
  );
}
