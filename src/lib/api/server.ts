import "server-only";
import { cookies, headers } from "next/headers";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, apiUrl, clientIpFrom, proxyHeaders, REFRESH_COOKIE, REFRESH_MAX_AGE, type TokenPair } from "./tokens";

/** An error the API answered with. `message` is safe to show to the user. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly fields?: Record<string, string>, options?: { cause?: unknown }) {
    super(message, options);
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Send the signed-in user's access token (default true). */
  auth?: boolean;
  /** Use this access token instead of the cookie, e.g. right after sign-up. */
  token?: string;
};

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/** Stores a fresh token pair. Only works inside a Server Action or Route Handler. */
export async function setSessionCookies(tokens: TokenPair) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_MAX_AGE));
  jar.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

async function request(path: string, opts: Options, token: string | undefined) {
  const url = new URL(path, apiUrl());
  const clientIp = clientIpFrom((await headers()).get("x-forwarded-for"));
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  return fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      accept: "application/json",
      ...(opts.body !== undefined && { "content-type": "application/json" }),
      ...(token && { authorization: `Bearer ${token}` }),
      ...proxyHeaders(clientIp),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
}

async function toError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
  if (res.status >= 500 || !body?.message) return new ApiError(res.status, "Something went wrong on our side. Please try again.");
  // Validation errors arrive as ["field: message", ...].
  if (Array.isArray(body.message)) {
    const fields: Record<string, string> = {};
    const lines = body.message.map(String);
    for (const line of lines) {
      const at = line.indexOf(": ");
      if (at > 0) fields[line.slice(0, at).split(".")[0]] ??= line.slice(at + 2);
    }
    const first = lines[0] ?? "Please check the form.";
    return new ApiError(res.status, Object.keys(fields).length ? "Please check the highlighted fields." : first, fields);
  }
  return new ApiError(res.status, String(body.message));
}

/**
 * Calls the dropoff API from the server with the signed-in user's token.
 * The proxy refreshes an expired access token before any page or Server Action
 * runs, so this never refreshes on its own (a refreshed token it couldn't save
 * would end the session).
 */
export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const token = opts.token ?? (opts.auth === false ? undefined : (await cookies()).get(ACCESS_COOKIE)?.value);
  let res: Response;
  try {
    res = await request(path, opts, token);
  } catch (cause) {
    // Next.js stops fetches when it finishes prerendering a page's static shell; let it handle those.
    if (cause instanceof Error && cause.message.startsWith("During prerendering")) throw cause;
    throw new ApiError(503, "We can't reach the dropoff service right now. Please try again in a moment.", undefined, { cause });
  }
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Turns any thrown value into a message for a form. */
export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}
