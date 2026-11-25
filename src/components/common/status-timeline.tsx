import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Steps up to and including `current` show as done; `current` is highlighted. */
export function StatusTimeline({ steps, current }: { steps: string[]; current: string }) {
  const idx = steps.indexOf(current);
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === idx ? "step" : undefined} className="flex items-center gap-3 text-sm">
          <span className={cn("grid size-6 place-items-center rounded-full border text-xs",
            i < idx && "border-primary bg-primary text-primary-foreground",
            i === idx && "border-primary text-brand-ink ring-4 ring-primary/15")}>
            {i < idx ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span className={cn(i > idx && "text-muted-foreground", i === idx && "font-medium")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
