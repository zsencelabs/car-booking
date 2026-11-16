"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(2, "Name on card is required"),
  card: z.string().regex(/^\d{4}( ?\d{4}){3}$/, "Enter a 16-digit card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cvc: z.string().regex(/^\d{3,4}$/, "3–4 digits"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  terms: z.boolean().refine((v) => v, "You must accept the terms"),
});
type Values = z.infer<typeof schema>;

export function PaymentForm({ confirmHref }: { confirmHref: string }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  });

  const terms = useWatch({ control, name: "terms" });

  const err = (k: keyof Values) => errors[k] && <p role="alert" className="text-xs text-destructive">{errors[k]?.message as string}</p>;

  return (
    <form noValidate onSubmit={handleSubmit(() => router.push(confirmHref))} className="space-y-4 rounded-2xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Payment details</h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" />
          You pay after the ride. A card authorization may be placed beforehand as a safeguard and is not the final charge.
        </p>
      </div>
      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Design preview only. Do not enter real card details. In production the card form will be provided by the payment processor.</p>
      <div className="space-y-1.5"><Label htmlFor="name">Name on card</Label><Input id="name" autoComplete="cc-name" {...register("name")} aria-invalid={!!errors.name} />{err("name")}</div>
      <div className="space-y-1.5"><Label htmlFor="card">Card number</Label><Input id="card" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" {...register("card")} aria-invalid={!!errors.card} />{err("card")}</div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5"><Label htmlFor="expiry">Expiry</Label><Input id="expiry" placeholder="MM/YY" autoComplete="off" {...register("expiry")} aria-invalid={!!errors.expiry} />{err("expiry")}</div>
        <div className="space-y-1.5"><Label htmlFor="cvc">CVC</Label><Input id="cvc" inputMode="numeric" autoComplete="off" {...register("cvc")} aria-invalid={!!errors.cvc} />{err("cvc")}</div>
        <div className="space-y-1.5"><Label htmlFor="zip">ZIP</Label><Input id="zip" inputMode="numeric" autoComplete="off" {...register("zip")} aria-invalid={!!errors.zip} />{err("zip")}</div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setValue("terms", v === true, { shouldValidate: true })} />
          <Label htmlFor="terms" className="text-sm font-normal leading-snug">I agree to the terms and the cancellation policy.</Label>
        </div>
        {err("terms")}
      </div>
      <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={isSubmitting}>Confirm booking</Button>
    </form>
  );
}
