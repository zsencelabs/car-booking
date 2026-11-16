import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div><h1 className="text-2xl font-semibold tracking-tight">Create your account</h1><p className="text-sm text-muted-foreground">Choose how you&apos;ll use the platform.</p></div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-brand-ink hover:underline">Log in</Link></p>
    </div>
  );
}
