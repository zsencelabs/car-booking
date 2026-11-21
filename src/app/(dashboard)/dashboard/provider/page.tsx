import type { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";

export const metadata: Metadata = { title: "Provider dashboard", robots: { index: false } };

export default function Page() {
  return <RoleDashboard role="provider" />;
}
