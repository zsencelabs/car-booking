import "server-only";
import { cookies } from "next/headers";

export const TZ_COOKIE = "tz";
/** Until the browser reports its zone, times show in the launch market's zone. */
const FALLBACK = "America/New_York";

/** The visitor's IANA time zone, as reported by their browser. */
export async function viewerTimeZone() {
  const raw = (await cookies()).get(TZ_COOKIE)?.value;
  if (!raw) return FALLBACK;
  try {
    const tz = raw.includes("%") ? decodeURIComponent(raw) : raw;
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return FALLBACK;
  }
}
