"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlaceValue = { address: string; lat?: number; lng?: number };

type Suggestion = { id: string; name: string; detail: string };

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const BASE = "https://api.mapbox.com/search/searchbox/v1";

/** One Mapbox search session per typed address: suggestions plus the final pick are billed together. */
const newSession = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));

/**
 * Address search with Mapbox (US only). Typing clears the coordinates; picking a
 * suggestion sets the full address and its coordinates, which the API needs to
 * price the ride.
 */
export function AddressInput({ id, value, onChange, placeholder, invalid, inputClassName, autoComplete }: {
  id: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  placeholder?: string;
  invalid?: boolean;
  inputClassName?: string;
  autoComplete?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(TOKEN ? null : "Address search isn't set up yet (missing Mapbox token).");
  // Created on first search, not during render.
  const session = useRef<string | null>(null);
  const typed = useRef(false);

  // Ask Mapbox for suggestions a moment after typing stops.
  useEffect(() => {
    const q = value.address.trim();
    if (!TOKEN || !typed.current || q.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL(`${BASE}/suggest`);
        session.current ??= newSession();
        url.search = new URLSearchParams({ q, access_token: TOKEN, session_token: session.current, country: "us", language: "en", limit: "6", proximity: "ip" }).toString();
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { suggestions: { mapbox_id: string; name: string; full_address?: string; place_formatted?: string }[] };
        setItems(body.suggestions.map((s) => ({ id: s.mapbox_id, name: s.name, detail: s.full_address ?? s.place_formatted ?? "" })));
        setActive(-1);
        setOpen(true);
        setProblem(null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setProblem("Address search is unavailable right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value.address]);

  async function pick(s: Suggestion) {
    setOpen(false);
    setLoading(true);
    try {
      const url = new URL(`${BASE}/retrieve/${encodeURIComponent(s.id)}`);
      url.search = new URLSearchParams({ access_token: TOKEN!, session_token: session.current ?? newSession() }).toString();
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { features: { geometry: { coordinates: [number, number] }; properties: { name: string; full_address?: string } }[] };
      const f = body.features[0];
      const [lng, lat] = f.geometry.coordinates;
      const full = f.properties.full_address ?? s.detail;
      typed.current = false;
      onChange({ address: full && !full.startsWith(f.properties.name) ? `${f.properties.name}, ${full}` : full || f.properties.name, lat, lng });
      session.current = null;
    } catch {
      setProblem("Couldn't load that address. Please pick it again.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); void pick(items[active]); }
    else if (e.key === "Escape") setOpen(false);
  }

  const showList = open && items.length > 0;

  return (
    <div className="relative w-full">
      <input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        aria-describedby={problem ? `${listId}-problem` : undefined}
        value={value.address}
        onChange={(e) => { typed.current = true; onChange({ address: e.target.value }); }}
        onKeyDown={onKeyDown}
        onFocus={() => items.length > 0 && value.lat === undefined && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete={autoComplete ?? "off"}
        className={inputClassName}
      />
      {loading && <Loader2 aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      {problem && <p id={`${listId}-problem`} className="sr-only">{problem}</p>}
      {showList && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
          {items.map((s, i) => (
            <li
              key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); void pick(s); }}
              onMouseEnter={() => setActive(i)}
              className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left", i === active && "bg-muted")}
            >
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{s.name}</span>
                {s.detail && <span className="block truncate text-xs text-muted-foreground">{s.detail}</span>}
              </span>
            </li>
          ))}
          <li aria-hidden className="px-2.5 pb-1 pt-1.5 text-right text-[10px] text-muted-foreground">Search by Mapbox</li>
        </ul>
      )}
    </div>
  );
}

/** A message for an address that hasn't been picked from the list yet, or null when it's fine. */
export function addressProblem(value: PlaceValue, label: string) {
  if (!TOKEN) return "Address search isn't available yet, so rides can't be booked online right now.";
  if (value.address.trim().length < 3) return `Enter a ${label}`;
  if (value.lat === undefined || value.lng === undefined) return `Choose the ${label} from the suggestions`;
  return null;
}
