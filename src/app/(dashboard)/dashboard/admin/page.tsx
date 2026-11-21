import type { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false } };

export default function Page() {
  return <RoleDashboard role="admin" />;
}
