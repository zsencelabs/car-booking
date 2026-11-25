/**
 * DEMO role system. Anyone can pick any role, so this is NOT real security.
 * Replace the session and login with a real identity provider before launch.
 */
export const ROLES = ["customer", "driver", "provider", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const SESSION_COOKIE = "dropoff_demo_role";

export const ROLE_INFO: Record<Role, { label: string; name: string; description: string; path: string }> = {
  customer: { label: "Customer", name: "Demo Customer", description: "Book rides and track your trips", path: "/dashboard/customer" },
  driver: { label: "Driver", name: "Demo Driver", description: "See jobs, earnings and documents", path: "/dashboard/driver" },
  provider: { label: "Car provider", name: "Demo Fleet", description: "Manage vehicles, drivers and revenue", path: "/dashboard/provider" },
  admin: { label: "Admin", name: "Demo Admin", description: "Oversee the whole platform", path: "/dashboard/admin" },
};

export type SessionUser = { role: Role; name: string; label: string; path: string };

/**
 * Roles the demo login offers. The demo Admin view is local-only: on a production
 * build it is hidden and an `admin` cookie is ignored, unless
 * NEXT_PUBLIC_DEMO_ADMIN=true is set at build time.
 */
export const DEMO_ROLES: readonly Role[] =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_ADMIN === "true"
    ? ROLES
    : ROLES.filter((r) => r !== "admin");

/** Whether a value is a role the demo login currently accepts. */
export const isRole = (value: unknown): value is Role => DEMO_ROLES.includes(value as Role);

export const userForRole = (role: Role): SessionUser => {
  const { name, label, path } = ROLE_INFO[role];
  return { role, name, label, path };
};

/** Whether a role may open a path. Non-dashboard paths are public. */
export function canAccess(role: Role, path: string) {
  const pathname = path.split(/[?#]/)[0];
  if (pathname !== "/dashboard" && !pathname.startsWith("/dashboard/")) return true;
  const own = ROLE_INFO[role].path;
  return pathname === "/dashboard" || pathname === own || pathname.startsWith(`${own}/`);
}

/** Keeps a post-login redirect on this site. Returns null for anything external. */
export function safeReturnPath(next?: string | null) {
  if (!next || !next.startsWith("/")) return null;
  const base = "https://dropoff.invalid";
  try {
    const url = new URL(next, base);
    return url.origin === base ? `${url.pathname}${url.search}` : null;
  } catch {
    return null;
  }
}
