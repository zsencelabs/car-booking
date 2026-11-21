import { Suspense } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BRAND, MAIN_NAV } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DesktopAccountNav, MobileAccountNav } from "./account-nav";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-site md:h-24 items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-9 text-[15px] font-medium md:flex">
          {MAIN_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle className="size-11 rounded-full" />
          <Suspense fallback={<span aria-hidden className="h-11 w-56 lg:w-90" />}>
            <DesktopAccountNav />
          </Suspense>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="size-11 rounded-full" />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" className="size-11 rounded-full" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4">{BRAND.name}</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
                {MAIN_NAV.map((l) => (
                  <SheetClose key={l.href} render={<Link href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted" />}>
                    {l.label}
                  </SheetClose>
                ))}
                <Suspense fallback={null}>
                  <MobileAccountNav />
                </Suspense>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
