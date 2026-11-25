"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { FormField } from "@/components/common/field";
import { PasswordInput } from "@/components/common/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth/actions";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState(login, undefined);
  const err = (k: string) => (state?.fields?.[k] ? { type: "server", message: state.fields[k] } : undefined);

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormField id="email" label="Email" error={err("email")}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} />
      </FormField>
      <FormField id="password" label="Password" error={err("password")}>
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!err("password")} />
      </FormField>
      {state?.error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full rounded-full text-[15px]">
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        {pending ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}
