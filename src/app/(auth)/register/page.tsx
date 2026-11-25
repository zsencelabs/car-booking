import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Create an account"
      headline="One account."
      accent="Every ride."
      text="Book a ride, apply to drive, or put your fleet to work on the same platform."
      title="Create your account"
      subtitle="Choose how you'll use the platform."
    >
      <Suspense fallback={<div aria-hidden className="h-96" />}>
        <RegisterForm />
      </Suspense>
      <p className="mt-7 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-brand-ink hover:underline">Log in</Link></p>
    </AuthShell>
  );
}
