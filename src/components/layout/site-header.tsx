import Link from "next/link";
import { Menu } from "lucide-react";
import { BRAND, MAIN_NAV } from "@/lib/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

export function Logo() {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className="text-2xl font-semibold leading-none tracking-[-0.05em]">
      {BRAND.name}<span className="text-brand-ink">.</span>
    </Link>
  );
}

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
          <Link href="/login" className={buttonVariants({ variant: "ghost", className: "h-11 rounded-full px-5 text-[15px]" })}>Log in</Link>
          <Link href="/book" className={buttonVariants({ className: "h-11 rounded-full px-6 text-[15px]" })}>Book a ride</Link>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
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
                <SheetClose render={<Link href="/drivers/register" className="rounded-lg px-3 py-2 text-sm hover:bg-muted" />}>Drive with us</SheetClose>
                <SheetClose render={<Link href="/providers/register" className="rounded-lg px-3 py-2 text-sm hover:bg-muted" />}>Register your fleet</SheetClose>
                <SheetClose render={<Link href="/login" className={buttonVariants({ variant: "outline", className: "mt-3" })} />}>Log in</SheetClose>
                <SheetClose render={<Link href="/book" className={buttonVariants()} />}>Book a ride</SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
