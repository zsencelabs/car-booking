"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (sent) return <p role="status" className="rounded-2xl bg-primary/15 p-4 text-sm">If an account exists for that email, a reset link has been sent (design preview).</p>;
  return (
    <form noValidate onSubmit={handleSubmit(() => setSent(true))} className="space-y-5">
      <FormField id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} /></FormField>
      <Button type="submit" size="lg" className="h-12 w-full rounded-full text-[15px]">Send reset link</Button>
    </form>
  );
}
