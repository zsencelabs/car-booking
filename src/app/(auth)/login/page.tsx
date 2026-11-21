import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Your next ride"
      accent="starts here."
      text="Verified drivers, approved vehicles, and no charge until your ride is complete."
      title="Log in"
      subtitle="Choose a role to explore dropoff. This is a demo, so no password is needed."
    >
      <Suspense fallback={<div aria-hidden className="h-88" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-7 text-center text-sm text-muted-foreground">New here? <Link href="/register" className="font-medium text-brand-ink hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}
