import { Suspense } from "react";
import Link from "next/link";
import { BRAND, FOOTER_NAV } from "@/lib/config";
import { Logo } from "./logo";

async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-12 md:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{BRAND.tagline}</p>
          <p className="text-xs text-muted-foreground">Serving the {BRAND.market}.</p>
        </div>
        {Object.entries(FOOTER_NAV).map(([title, links]) => (
          <div key={title}>
            <h3 className="mb-3 text-sm font-semibold">{title}</h3>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © <Suspense fallback={null}><CurrentYear /></Suspense> {BRAND.name}. Design preview — not a live service.
      </div>
    </footer>
  );
}
