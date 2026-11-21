import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

async function SendToOwnDashboard() {
  const user = await getSessionUser();
  redirect(user?.path ?? "/login");
  return null;
}

export default function Page() {
  return <Suspense><SendToOwnDashboard /></Suspense>;
}
