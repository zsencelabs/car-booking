"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usd } from "@/lib/mock/fare";
import { cn } from "@/lib/utils";

const MAX_TIP = 500;

/** A custom tip in dollars: a positive amount up to $500 with at most two decimals, or an error. */
function parseTip(raw: string): { amount: number } | { error: string } | null {
  const value = raw.trim().replace(/^\$/, "");
  if (!value) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return { error: "Enter an amount like 5 or 7.50" };
  const amount = Number(value);
  if (amount <= 0) return { error: "Enter an amount above $0" };
  if (amount > MAX_TIP) return { error: `Tips are capped at ${usd(MAX_TIP)}` };
  return { amount };
}

function Stars({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div role="radiogroup" aria-label={`${label} rating`} className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)} className="p-0.5">
            <Star className={cn("size-6", n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** What the customer sees after the ride completes: separate driver/vehicle ratings + optional tip. */
export function PostRidePreview({ fare }: { fare: number }) {
  const [driver, setDriver] = useState(0);
  const [vehicle, setVehicle] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const presets = [0.1, 0.15, 0.2].map((p) => Math.round(fare * p * 100) / 100);
  const customTip = parseTip(custom);
  const tipError = customTip && "error" in customTip ? customTip.error : null;

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">After your ride</h2>
        <p className="text-sm text-muted-foreground">Preview of the rating and tip step shown once the ride is completed.</p>
      </div>
      <div className="space-y-3">
        <Stars label="Driver" value={driver} onChange={setDriver} />
        <Stars label="Vehicle" value={vehicle} onChange={setVehicle} />
        <div className="space-y-1.5">
          <Label htmlFor="review">Review (optional)</Label>
          <Textarea id="review" placeholder="How was your ride?" rows={3} maxLength={1000} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Add a tip (100% goes to your driver)</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((v) => (
            <Button key={v} type="button" variant={tip === v && !custom ? "default" : "outline"} onClick={() => { setTip(v); setCustom(""); }}>{usd(v)}</Button>
          ))}
          <Input aria-label="Custom tip amount" aria-invalid={!!tipError} aria-describedby={tipError ? "tip-error" : undefined} inputMode="decimal" placeholder="Custom $" value={custom} onChange={(e) => { setCustom(e.target.value); setTip(null); }} className="w-28" />
        </div>
        {tipError && <p id="tip-error" role="alert" className="text-xs text-destructive">{tipError}</p>}
      </div>
      <Button type="button" onClick={() => toast.success("Thanks for your feedback (design preview)")} disabled={!!tipError || (!driver && !vehicle && tip === null && !customTip)}>Submit</Button>
    </div>
  );
}
