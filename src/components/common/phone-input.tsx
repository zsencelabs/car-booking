"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Search } from "lucide-react";
import { AsYouType, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FlagSet = Partial<Record<CountryCode, React.ComponentType<{ className?: string }>>>;
type PhoneState = { country: CountryCode; text: string; value: string };

const DEFAULT_COUNTRY: CountryCode = "US";

/** The country to show when several share one dial code and the number can't tell them apart yet. */
const PRIMARY_COUNTRY: Record<string, CountryCode> = {
  "1": "US", "7": "RU", "39": "IT", "44": "GB", "47": "NO", "61": "AU",
  "212": "MA", "262": "RE", "290": "SH", "358": "FI", "590": "GP", "599": "CW",
};

const digitsOf = (s: string) => s.replace(/\D/g, "");

const primaryCountry = (code: string) =>
  PRIMARY_COUNTRY[code] ?? getCountries().find((c) => getCountryCallingCode(c) === code) ?? DEFAULT_COUNTRY;

function formatNational(country: CountryCode, national: string): PhoneState {
  const typer = new AsYouType(country);
  const text = typer.input(national);
  // UK, Guernsey, Jersey and Isle of Man share mobile ranges, so keep the country already shown.
  const detected = getCountryCallingCode(country) === "44" ? country : typer.getCountry();
  return { country: detected ?? country, text, value: typer.getNumberValue() ?? "" };
}

function fromInternational(number: string): PhoneState | null {
  const typer = new AsYouType();
  typer.input(number);
  const code = typer.getCallingCode();
  if (!code) return null;
  const country = code === "44" ? "GB" : typer.getCountry() ?? primaryCountry(code);
  return formatNational(country, digitsOf(number).slice(code.length));
}

let flagsLoading: Promise<FlagSet> | undefined;
const loadFlags = () => (flagsLoading ??= import("country-flag-icons/react/3x2").then((m) => m as unknown as FlagSet));

function Flag({ flags, country }: { flags: FlagSet | null; country: CountryCode }) {
  const Svg = flags?.[country];
  return (
    <span aria-hidden className="block h-4 w-6 shrink-0 overflow-hidden rounded-[3px] bg-muted ring-1 ring-foreground/10">
      {Svg && <Svg className="block size-full" />}
    </span>
  );
}

let countryList: { code: CountryCode; name: string; dial: string }[] | undefined;
function getCountryList() {
  if (countryList) return countryList;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  countryList = getCountries()
    .map((code) => ({ code, name: names.of(code) ?? code, dial: getCountryCallingCode(code) as string }))
    .sort((a, b) => (a.code === DEFAULT_COUNTRY ? -1 : b.code === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name)));
  return countryList;
}

export function PhoneInput({ id, value, onChange, onBlur, ref, autoComplete = "tel", "aria-invalid": invalid }: {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: (el: HTMLInputElement | null) => void;
  autoComplete?: string;
  "aria-invalid"?: boolean;
}) {
  const [phone, setPhone] = useState<PhoneState>(() =>
    (value && fromInternational(value)) || { country: DEFAULT_COUNTRY, text: "", value: "" });
  const [flags, setFlags] = useState<FlagSet | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const caretDigits = useRef<number | null>(null);
  const listId = useId();

  const { country, text } = phone;
  const typingCode = text.startsWith("+");
  const dial = getCountryCallingCode(country);

  useEffect(() => {
    let live = true;
    loadFlags().then((f) => { if (live) setFlags(f); });
    return () => { live = false; };
  }, []);

  // Formatting adds spaces and brackets, so put the caret back after the same digit.
  useLayoutEffect(() => {
    const n = caretDigits.current;
    if (n === null) return;
    caretDigits.current = null;
    const el = inputRef.current;
    if (!el || document.activeElement !== el) return;
    let pos = text.length;
    if (n !== Infinity) {
      let seen = 0;
      pos = 0;
      while (pos < text.length && seen < n) {
        if (/\d/.test(text[pos])) seen++;
        pos++;
      }
    }
    el.setSelectionRange(pos, pos);
  });

  const results = useMemo(() => {
    if (!open) return [];
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return getCountryList();
    return getCountryList().filter((c) => c.name.toLowerCase().includes(q) || c.dial.startsWith(q) || c.code.toLowerCase() === q);
  }, [open, query]);

  function commit(next: PhoneState) {
    setPhone(next);
    onChange(next.value);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value;
    let caret = e.target.selectionStart ?? raw.length;

    // Backspacing over a bracket or space should remove the digit before it.
    if (raw.length < text.length && digitsOf(raw) === digitsOf(text) && !raw.startsWith("+")) {
      let i = caret - 1;
      while (i >= 0 && !/\d/.test(raw[i])) i--;
      if (i >= 0) {
        raw = raw.slice(0, i) + raw.slice(i + 1);
        caret = i;
      }
    }

    if (raw.trim().startsWith("+")) {
      const number = `+${digitsOf(raw)}`;
      caretDigits.current = Infinity;
      commit(fromInternational(number) ?? { country, text: number, value: "" });
      return;
    }
    caretDigits.current = caret >= raw.length ? Infinity : digitsOf(raw.slice(0, caret)).length;
    commit(formatNational(country, digitsOf(raw)));
  }

  function pickCountry(code: CountryCode) {
    const national = typingCode ? "" : digitsOf(text);
    const next = formatNational(code, national);
    commit({ ...next, country: code });
    setOpen(false);
  }

  function moveActive(delta: number) {
    if (!results.length) return;
    const next = (active + delta + results.length) % results.length;
    setActive(next);
    document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) pickCountry(results[active].code);
    }
  }

  return (
    <div
      className={cn(
        "flex h-12 w-full min-w-0 items-stretch rounded-xl border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        invalid && "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      )}
    >
      <Popover
        open={open}
        onOpenChange={(next) => { setOpen(next); if (next) { setQuery(""); setActive(0); } }}
      >
        <PopoverTrigger
          aria-label={`Country code: ${getCountryName(country)} +${dial}. Change country`}
          className="flex shrink-0 items-center gap-2 rounded-l-xl border-r border-input pl-3.5 pr-2.5 text-sm font-medium outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted"
        >
          {typingCode ? <Globe aria-hidden className="size-4 text-muted-foreground" /> : <Flag flags={flags} country={country} />}
          {!typingCode && <span className="tabular-nums">+{dial}</span>}
          <ChevronDown aria-hidden className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={8} initialFocus={searchRef} finalFocus={inputRef} className="max-h-(--available-height) w-[min(20rem,calc(100vw-2rem))] gap-1.5 overflow-y-auto rounded-2xl p-2">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              role="combobox"
              aria-label="Search countries"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onSearchKey}
              placeholder="Search country or code"
              className="h-10 w-full rounded-xl bg-muted/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <div id={listId} role="listbox" aria-label="Countries" className="max-h-64 overflow-y-auto overscroll-contain">
            {results.map((c, i) => (
              <button
                key={c.code}
                id={`${listId}-${i}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={c.code === country}
                onMouseEnter={() => setActive(i)}
                onClick={() => pickCountry(c.code)}
                className={cn("flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left text-sm", i === active && "bg-muted")}
              >
                <Flag flags={flags} country={c.code} />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">+{c.dial}</span>
                <Check aria-hidden className={cn("size-3.5 shrink-0", c.code === country ? "text-brand-ink" : "invisible")} />
              </button>
            ))}
            {results.length === 0 && <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">No countries found</p>}
          </div>
        </PopoverContent>
      </Popover>

      <input
        ref={(el) => { inputRef.current = el; ref?.(el); }}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        aria-invalid={invalid}
        value={text}
        onChange={handleInput}
        onBlur={onBlur}
        placeholder={country === DEFAULT_COUNTRY ? "(555) 000-0000" : "Phone number"}
        className="h-full w-full min-w-0 flex-1 rounded-r-xl bg-transparent px-3.5 text-base tabular-nums outline-none placeholder:text-muted-foreground md:text-sm"
      />
    </div>
  );
}

function getCountryName(code: CountryCode) {
  return getCountryList().find((c) => c.code === code)?.name ?? code;
}
