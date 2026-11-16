"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(8, "At least 8 characters") });
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <form noValidate onSubmit={handleSubmit(() => { toast.success("Signed in (design preview, no real auth yet)"); router.push("/book"); })} className="space-y-4">
      <FormField id="email" label="Email" error={errors.email}><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} /></FormField>
      <FormField id="password" label="Password" error={errors.password}><Input id="password" type="password" autoComplete="current-password" {...register("password")} aria-invalid={!!errors.password} /></FormField>
      <div className="text-right text-sm"><Link href="/forgot-password" className="text-brand-ink hover:underline">Forgot password?</Link></div>
      <Button type="submit" size="lg" className="h-10 w-full">Log in</Button>
    </form>
  );
}
