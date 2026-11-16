import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div><h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1><p className="text-sm text-muted-foreground">Log in to book and manage rides.</p></div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">New here? <Link href="/register" className="text-brand-ink hover:underline">Create an account</Link></p>
    </div>
  );
}
