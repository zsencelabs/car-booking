import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";

export function FormField({ id, label, error, hint, children }: { id: string; label: string; error?: FieldError; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
