"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CarFront, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[\d\s()-]{10,}$/, "Enter a valid phone number"),
  password: z.string().min(8, "At least 8 characters"),
});
type Values = z.infer<typeof schema>;

const ROLES = [
  { id: "customer", label: "Rider", text: "Book rides", icon: Users },
  { id: "driver", label: "Driver", text: "Earn driving", icon: UserRound },
  { id: "provider", label: "Fleet", text: "List vehicles", icon: CarFront },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("customer");
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Account type" className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button key={r.id} type="button" role="radio" aria-checked={role === r.id} onClick={() => setRole(r.id)}
            className={cn("rounded-xl border bg-card p-3 text-center transition-colors", role === r.id ? "border-primary bg-primary/5" : "hover:bg-muted")}>
            <r.icon className="mx-auto mb-1 size-5 text-brand-ink" />
            <span className="block text-sm font-medium">{r.label}</span>
            <span className="block text-xs text-muted-foreground">{r.text}</span>
          </button>
        ))}
      </div>

      {role === "customer" ? (
        <form noValidate onSubmit={handleSubmit(() => { toast.success("Account created (design preview)"); router.push("/book"); })} className="space-y-4">
          <FormField id="name" label="Full name" error={errors.name}><Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} /></FormField>
          <FormField id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} /></FormField>
          <FormField id="phone" label="Phone" error={errors.phone}><Input id="phone" type="tel" autoComplete="tel" {...register("phone")} aria-invalid={!!errors.phone} /></FormField>
          <FormField id="password" label="Password" error={errors.password} hint="At least 8 characters"><Input id="password" type="password" autoComplete="new-password" {...register("password")} aria-invalid={!!errors.password} /></FormField>
          <Button type="submit" size="lg" className="h-10 w-full">Create account</Button>
        </form>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-5 text-sm">
          <p className="text-muted-foreground">
            {role === "driver"
              ? "Drivers complete identity, license and background verification before accepting jobs."
              : "Providers submit business, insurance and payout details, then add vehicles and drivers."}
          </p>
          <Link href={role === "driver" ? "/drivers/register" : "/providers/register"} className={buttonVariants({ size: "lg", className: "h-10 w-full" })}>
            Start {role === "driver" ? "driver" : "provider"} application
          </Link>
        </div>
      )}
    </div>
  );
}
