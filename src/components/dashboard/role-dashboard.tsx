import { Suspense } from "react";
import type { Role } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "./dashboard-shell";

async function Content({ role }: { role: Role }) {
  const user = await requireRole(role);
  return <DashboardShell user={user} />;
}

export function RoleDashboard({ role }: { role: Role }) {
  return (
    <Suspense fallback={<div aria-hidden className="h-dvh bg-background" />}>
      <Content role={role} />
    </Suspense>
  );
}
