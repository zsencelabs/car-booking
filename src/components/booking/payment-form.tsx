"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Card-number checksum (Luhn), which catches most typos. */
function luhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return sum % 10 === 0;
}

/** MM/YY is valid through the last day of that month. */
function notExpired(value: string) {
  const [mm, yy] = value.split("/").map(Number);
  const now = new Date();
  return 2000 + yy > now.getFullYear() || (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1);
}

const schema = z.object({
  name: z.string().trim().min(2, "Name on card is required"),
  card: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{15,16}$/, "Enter a 15 or 16-digit card number").refine(luhn, "Check the card number")),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY").refine(notExpired, "This card has expired"),
  cvc: z.string().regex(/^\d{3,4}$/, "3–4 digits"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  terms: z.boolean().refine((v) => v, "You must accept the terms"),
});
type Input = z.input<typeof schema>;
type Values = z.output<typeof schema>;

export function PaymentForm({ confirmHref }: { confirmHref: string }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<Input, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  });

  const terms = useWatch({ control, name: "terms" });

  const err = (k: keyof Input) => errors[k] && <p role="alert" className="text-xs text-destructive">{errors[k]?.message as string}</p>;

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
          <Label htmlFor="terms" className="text-sm font-normal leading-snug">
            <span>I agree to the <Link href="/terms" target="_blank" className="underline underline-offset-4">terms</Link>. Cancellation and refund terms will be shown here before launch.</span>
          </Label>
        </div>
        {err("terms")}
      </div>
      <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting}>Confirm booking</Button>
    </form>
  );
}
