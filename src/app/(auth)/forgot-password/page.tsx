import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div><h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1><p className="text-sm text-muted-foreground">We&apos;ll email you a link to set a new one.</p></div>
      <ForgotForm />
      <p className="text-center text-sm"><Link href="/login" className="text-brand-ink hover:underline">Back to log in</Link></p>
    </div>
  );
}
