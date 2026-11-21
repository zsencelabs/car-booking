"use client";

import { Check, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentRequirement } from "@/types";

/** UI-only: records the chosen file name. Nothing is uploaded; secure encrypted storage arrives with the backend. */
export function FileDropzone({ doc, value, onChange, error }: { doc: DocumentRequirement; value?: string; onChange: (name: string) => void; error?: string }) {
  const id = `doc-${doc.id}`;
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-2xl bg-muted/50 p-4 transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50",
          error && "bg-destructive/10 hover:bg-destructive/10",
          value && "bg-primary/15 hover:bg-primary/20",
        )}
      >
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full transition-colors", value ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground")}>
          {value ? <Check className="size-4" /> : <UploadCloud className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{doc.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{value ?? doc.description ?? "PDF, JPG or PNG"}</span>
        </span>
        <span className="shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {doc.conditional ? "If applicable" : doc.required ? "Required" : "Optional"}
        </span>
        <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f.name); }} />
      </label>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
