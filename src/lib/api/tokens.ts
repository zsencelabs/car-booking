/** Session cookies and token refresh, shared by the proxy and server code. */

export const ACCESS_COOKIE = "dropoff_at";
export const REFRESH_COOKIE = "dropoff_rt";
/** The API's access tokens last 15 minutes; the cookie goes a minute early so a refresh happens first. */
export const ACCESS_MAX_AGE = 14 * 60;
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

export type TokenPair = { accessToken: string; refreshToken: string };

/** The visitor's IP from Vercel's `x-forwarded-for` (first entry). */
export const clientIpFrom = (forwardedFor: string | null) => forwardedFor?.split(",")[0]?.trim() || undefined;

/**
 * Headers that let the API rate-limit per visitor instead of per website server.
 * The API only trusts `x-client-ip` together with the shared secret.
 */
export function proxyHeaders(clientIp: string | undefined): Record<string, string> {
  const secret = process.env.API_PROXY_SECRET;
  return secret && clientIp ? { "x-proxy-secret": secret, "x-client-ip": clientIp } : {};
}

export function apiUrl() {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL is not set. Add it to .env.local, e.g. API_URL=http://localhost:4000");
  return url;
}

/**
 * The API treats a second use of a refresh token as theft and ends the session,
 * so concurrent requests holding the same token share one refresh, and its
 * result is reused for a short while.
 */
const inflight = new Map<string, { at: number; result: Promise<TokenPair | null> }>();
const REUSE_MS = 30_000;

export function refreshTokens(refreshToken: string, clientIp?: string): Promise<TokenPair | null> {
  const now = Date.now();
  for (const [key, entry] of inflight) if (now - entry.at > REUSE_MS) inflight.delete(key);
  const existing = inflight.get(refreshToken);
  if (existing) return existing.result;

  const result = (async () => {
    try {
      const res = await fetch(new URL("/auth/refresh", apiUrl()), {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", ...proxyHeaders(clientIp) },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const body = (await res.json()) as TokenPair;
      return body.accessToken && body.refreshToken ? body : null;
    } catch {
      return null;
    }
  })();
  inflight.set(refreshToken, { at: now, result });
  return result;
}
