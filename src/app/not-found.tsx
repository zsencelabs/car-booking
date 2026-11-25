import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center">
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <p className="eyebrow mb-3">404</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">We couldn&apos;t find that page</h1>
          <p className="mt-3 text-muted-foreground">
            The link may be old, or the page may have moved. Head home or start a new booking.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants()}>Back to home</Link>
            <Link href="/book" className={buttonVariants({ variant: "outline" })}>Book a ride</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
