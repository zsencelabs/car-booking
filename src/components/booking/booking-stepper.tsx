import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Ride details", "Choose vehicle", "Review & pay", "Confirmed"];

export function BookingStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol aria-label="Booking progress" className="flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="flex flex-1 items-center gap-2">
            <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium",
              done && "border-primary bg-primary text-primary-foreground",
              active && "border-primary text-brand-ink",
              !done && !active && "text-muted-foreground")}>
              {done ? <Check className="size-4" /> : n}
            </span>
            <span className={cn("hidden truncate sm:block", active ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {n < STEPS.length && <span className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
