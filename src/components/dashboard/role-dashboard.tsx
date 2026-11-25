import { Suspense } from "react";
import type { Role } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { loadDashboard } from "@/lib/dashboards/load";
import { DashboardShell } from "./dashboard-shell";

async function Content({ role }: { role: Role }) {
  const user = await requireRole(role);
  const config = await loadDashboard(user);
  return <DashboardShell user={user} config={config} />;
}

export function RoleDashboard({ role }: { role: Role }) {
  return (
    <Suspense fallback={<div aria-hidden className="h-dvh bg-background" />}>
      <Content role={role} />
    </Suspense>
  );
}
