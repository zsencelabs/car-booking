import Link from "next/link";
import { BRAND } from "@/lib/config";

export function Logo() {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className="text-2xl font-semibold leading-none tracking-[-0.05em]">
      {BRAND.name}<span className="text-brand-ink">.</span>
    </Link>
  );
}
