"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/bookings/actions";

/** Books the quoted ride. The price comes from the signed quote, so it can't be changed here. */
export function ConfirmBookingForm({ quoteToken }: { quoteToken: string }) {
  const [state, action, pending] = useActionState(createBooking, undefined);

  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-card p-6">
      <input type="hidden" name="quoteToken" value={quoteToken} />
      <div>
        <h2 className="text-lg font-semibold">Confirm your booking</h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" />
          You pay after the ride. Online payment isn&apos;t live yet, so no card is needed and nothing is charged through the site.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes for your driver (optional)</Label>
        <Textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="Gate code, terminal, luggage..." />
      </div>
      {state && !state.ok && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full text-base" disabled={pending}>
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Booking..." : "Confirm booking"}
      </Button>
      <p className="text-xs text-muted-foreground">By booking you agree to the <a href="/terms" target="_blank" className="underline underline-offset-4">terms</a>. You can cancel from the ride page before your ride starts.</p>
    </form>
  );
}
