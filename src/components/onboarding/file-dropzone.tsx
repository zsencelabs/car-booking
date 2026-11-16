"use client";

import { FileCheck2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentRequirement } from "@/types";

/** UI-only: records the chosen file name. Nothing is uploaded; secure encrypted storage arrives with the backend. */
export function FileDropzone({ doc, value, onChange, error }: { doc: DocumentRequirement; value?: string; onChange: (name: string) => void; error?: string }) {
  const id = `doc-${doc.id}`;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-colors hover:bg-muted/50 focus-within:ring-3 focus-within:ring-ring/50", error && "border-destructive", value && "border-primary bg-primary/5")}>
        {value ? <FileCheck2 className="size-6 shrink-0 text-brand-ink" /> : <UploadCloud className="size-6 shrink-0 text-muted-foreground" />}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {doc.label}
            <Badge variant={doc.required ? "default" : "secondary"}>{doc.required ? "Required" : "Optional"}</Badge>
            {doc.conditional && <Badge variant="outline">If applicable</Badge>}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{value ?? doc.description ?? "PDF, JPG or PNG"}</span>
        </span>
        <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f.name); }} />
      </label>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
