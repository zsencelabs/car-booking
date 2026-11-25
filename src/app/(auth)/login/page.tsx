import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Your next ride"
      accent="starts here."
      text="Verified drivers, approved vehicles, and no charge until your ride is complete."
      title="Log in"
      subtitle="Sign in to book rides, take jobs or manage your fleet."
    >
      <Suspense fallback={<div aria-hidden className="h-72" />}>
        <SignedInRedirect />
        <LoginForm />
      </Suspense>
      <p className="mt-7 text-center text-sm text-muted-foreground">New here? <Link href="/register" className="font-medium text-brand-ink hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}

/** Someone already signed in goes straight to their dashboard. */
async function SignedInRedirect() {
  const user = await getSessionUser();
  if (user) redirect(user.path);
  return null;
}
