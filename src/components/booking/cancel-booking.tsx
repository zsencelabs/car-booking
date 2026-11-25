"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cancelBooking } from "@/lib/bookings/actions";

export function CancelBooking({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}>Cancel ride</Button>;

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="space-y-1.5">
        <Label htmlFor="cancel-reason">Why are you cancelling? (optional)</Label>
        <Textarea id="cancel-reason" rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive" disabled={pending}
          onClick={() => start(async () => {
            const res = await cancelBooking(id, reason);
            if (!res.ok) return setError(res.error);
            toast.success("Your ride was cancelled");
            setOpen(false);
            router.refresh();
          })}
        >
          {pending ? "Cancelling..." : "Yes, cancel ride"}
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Keep ride</Button>
      </div>
    </div>
  );
}
