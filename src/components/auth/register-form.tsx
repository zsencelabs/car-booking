"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CarFront, UserRound, Users } from "lucide-react";
import { motion } from "motion/react";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { PhoneInput } from "@/components/common/phone-input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAs } from "@/lib/auth/actions";
import { phoneSchema } from "@/lib/phone";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: phoneSchema,
});
type Values = z.infer<typeof schema>;

const ROLES = [
  { id: "customer", label: "Rider", icon: Users },
  { id: "driver", label: "Driver", icon: UserRound },
  { id: "provider", label: "Fleet", icon: CarFront },
] as const;

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("customer");
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-7">
      <div role="radiogroup" aria-label="Account type" className="grid grid-cols-3 gap-1 rounded-full border bg-card/60 p-1.5">
        {ROLES.map((r) => {
          const selected = role === r.id;
          return (
            <button
              key={r.id} type="button" role="radio" aria-checked={selected} onClick={() => setRole(r.id)}
              className={cn("relative h-11 rounded-full text-sm font-medium transition-colors", selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {selected && (
                <motion.span layoutId="role-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
              )}
              <span className="relative inline-flex items-center gap-2"><r.icon className="size-4" />{r.label}</span>
            </button>
          );
        })}
      </div>

      {role === "customer" ? (
        <form noValidate onSubmit={handleSubmit(() => startTransition(() => loginAs("customer")))} className="space-y-5">
          <FormField id="name" label="Full name" error={errors.name}><Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} /></FormField>
          <FormField id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} /></FormField>
          <FormField id="phone" label="Phone" error={errors.phone}><Controller name="phone" control={control} render={({ field }) => <PhoneInput id="phone" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!errors.phone} />} /></FormField>
          <p className="text-xs text-muted-foreground">Demo mode: no password is needed and these details are not saved.</p>
          <Button type="submit" size="lg" disabled={pending} className="h-12 w-full rounded-full text-[15px]">{pending ? "Creating account..." : "Create account"}</Button>
        </form>
      ) : (
        <motion.div key={role} className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="leading-relaxed text-muted-foreground">
            {role === "driver"
              ? "Drivers complete identity, license and background verification before accepting jobs."
              : "Providers submit business, insurance and payout details, then add vehicles and drivers."}
          </p>
          <Link href={role === "driver" ? "/drivers/register" : "/providers/register"} className={cn(buttonVariants({ size: "lg" }), "group h-12 w-full gap-2 rounded-full text-[15px]")}>
            Start {role === "driver" ? "driver" : "provider"} application
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
