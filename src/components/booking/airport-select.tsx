"use client";

import { useId, useState } from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { airportByCode, searchAirports, type Airport } from "@/lib/airports";

/**
 * Pickup picker: rides start only at the listed airports. Focusing shows every
 * airport; typing filters by code, name or city. `value` is the airport code.
 */
export function AirportSelect({ id, value, onChange, placeholder = "Pickup airport", invalid, inputClassName, listClassName }: {
  id: string;
  value?: string;
  onChange: (airport: Airport | undefined) => void;
  placeholder?: string;
  invalid?: boolean;
  inputClassName?: string;
  listClassName?: string;
}) {
  const listId = useId();
  const selected = airportByCode(value);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const items = searchAirports(query ?? "");
  const showList = open && items.length > 0;
  const text = query ?? (selected ? `${selected.name} (${selected.code})` : "");

  function pick(a: Airport) {
    onChange(a);
    setQuery(null);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && showList && (active >= 0 || items.length === 1)) {
      e.preventDefault();
      pick(items[Math.max(active, 0)]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(null);
    }
  }

  return (
    <div className="relative w-full">
      <input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        value={text}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
          if (selected) onChange(undefined);
        }}
        onKeyDown={onKeyDown}
        onFocus={(e) => { setOpen(true); e.currentTarget.select(); }}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => { setOpen(false); setQuery(null); }, 150)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      {showList && (
        <ul
          id={listId} role="listbox"
          className={cn("absolute left-0 right-0 top-full z-50 mt-1 max-h-80 min-w-[16rem] overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg", listClassName)}
        >
          {items.map((a, i) => (
            <li
              key={a.code} id={`${listId}-${i}`} role="option" aria-selected={a.code === selected?.code}
              onMouseDown={(e) => { e.preventDefault(); pick(a); }}
              onMouseEnter={() => setActive(i)}
              className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left", i === active && "bg-muted")}
            >
              <Plane aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{a.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.address}</span>
              </span>
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">{a.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
