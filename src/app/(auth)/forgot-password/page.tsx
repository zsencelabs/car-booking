import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      headline="Locked out?"
      accent="Let's fix that."
      text="Enter your email and we'll send you a link to set a new password."
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
    >
      <ForgotForm />
      <p className="mt-7 text-center text-sm"><Link href="/login" className="font-medium text-brand-ink hover:underline">Back to log in</Link></p>
    </AuthShell>
  );
}
