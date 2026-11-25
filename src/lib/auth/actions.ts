"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api, ApiError, clearSessionCookies, errorMessage, setSessionCookies } from "@/lib/api/server";
import { REFRESH_COOKIE } from "@/lib/api/tokens";
import type { AuthResult } from "@/lib/api/types";
import { canAccess, ROLE_INFO, roleFromApi, safeReturnPath } from "./roles";

export type FormState = { error?: string; fields?: Record<string, string> } | undefined;

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

/** Signs in with email and password, then goes to the page the user came from or their dashboard. */
export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fields: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const { email, password, next } = parsed.data;
  let result: AuthResult;
  try {
    result = await api<AuthResult>("/auth/login", { method: "POST", body: { email, password }, auth: false });
  } catch (error) {
    return { error: errorMessage(error) };
  }
  await setSessionCookies(result);
  const role = roleFromApi(result.user.role);
  const target = safeReturnPath(next);
  redirect(target && canAccess(role, target) ? target : ROLE_INFO[role].path);
}

export type SignUp =
  | { role: "CUSTOMER" | "DRIVER"; name: string; email: string; password: string; phone?: string }
  | { role: "PROVIDER"; name: string; email: string; password: string; phone?: string; companyName: string; legalName?: string };

/**
 * Creates an account and signs it in. Profile details (`profile`) are saved
 * straight after, for drivers and companies applying in one go.
 */
export async function signUp(
  input: SignUp,
  profile?: { path: "/drivers/me" | "/providers/me"; body: Record<string, unknown> },
): Promise<{ ok: true; path: string } | { ok: false; error: string; fields?: Record<string, string> }> {
  let result: AuthResult;
  try {
    result = await api<AuthResult>("/auth/register", { method: "POST", body: input, auth: false });
  } catch (error) {
    return { ok: false, error: errorMessage(error), fields: error instanceof ApiError ? error.fields : undefined };
  }
  await setSessionCookies(result);
  const path = ROLE_INFO[roleFromApi(result.user.role)].path;
  if (profile) {
    try {
      // The new access token isn't readable from the cookie jar until the next request, so send it directly.
      await api(profile.path, { method: "PATCH", body: profile.body, token: result.accessToken });
    } catch (error) {
      return {
        ok: false,
        error: `Your account was created, but some details weren't saved: ${errorMessage(error)} You can finish them from your dashboard.`,
        fields: error instanceof ApiError ? error.fields : undefined,
      };
    }
  }
  return { ok: true, path };
}

export async function logout() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await api("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }).catch(() => undefined);
  }
  await clearSessionCookies();
  redirect("/");
}
