"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CarFront, Loader2, ShieldCheck, UserRound, Users } from "lucide-react";
import { loginAs } from "@/lib/auth/actions";
import { DEMO_ROLES, ROLE_INFO, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const ICONS: Record<Role, typeof Users> = { customer: Users, driver: UserRound, provider: CarFront, admin: ShieldCheck };

/** Demo sign-in. Deliberately has no password field, so nobody types a real one here. */
export function LoginForm() {
  const next = useSearchParams().get("next");
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<Role | null>(null);

  return (
    <div>
      <p className="eyebrow mb-3">Demo · Continue as</p>
      <div className="space-y-2">
        {DEMO_ROLES.map((role) => {
          const Icon = ICONS[role];
          const info = ROLE_INFO[role];
          const loading = pending && chosen === role;
          return (
            <button
              key={role}
              type="button"
              disabled={pending}
              onClick={() => { setChosen(role); startTransition(() => loginAs(role, next)); }}
              className={cn(
                "group flex w-full items-center gap-4 rounded-2xl bg-muted/50 p-3.5 text-left outline-none transition-colors hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait",
                pending && !loading && "opacity-50",
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{info.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{info.description}</span>
              </span>
              {loading
                ? <Loader2 aria-label="Signing in" className="size-4 shrink-0 animate-spin" />
                : <ArrowRight aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
