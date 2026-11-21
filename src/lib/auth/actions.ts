"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { canAccess, isRole, ROLE_INFO, safeReturnPath, SESSION_COOKIE } from "./roles";

export async function loginAs(role: string, next?: string | null) {
  if (!isRole(role)) redirect("/login");

  (await cookies()).set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const target = safeReturnPath(next);
  redirect(target && canAccess(role, target) ? target : ROLE_INFO[role].path);
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
