import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { logout } from "@/lib/auth/actions";
import { getSessionUser } from "@/lib/auth/session";
import { BRAND } from "@/lib/config";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./account-menu";

const pill = "h-11 rounded-full text-[15px]";
const sheetLink = "rounded-lg px-3 py-2 text-sm hover:bg-muted";

export async function DesktopAccountNav() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), pill, "px-5")}>Log in</Link>
        <Link href="/drivers/register" className={cn(buttonVariants({ variant: "outline" }), pill, "hidden px-5 lg:inline-flex")}>Drive with us</Link>
        <Link href="/book" className={cn(buttonVariants(), pill, "px-6")}>Book a ride</Link>
      </>
    );
  }

  return (
    <>
      {user.role === "customer"
        ? <Link href="/book" className={cn(buttonVariants(), pill, "px-6")}>Book a ride</Link>
        : <Link href={user.path} className={cn(buttonVariants(), pill, "px-6")}>Dashboard</Link>}
      <AccountMenu user={user} />
    </>
  );
}

export async function MobileAccountNav() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <>
        <SheetClose render={<Link href="/providers/register" className={sheetLink} />}>Register your fleet</SheetClose>
        <SheetClose render={<Link href="/drivers/register" className={cn(buttonVariants({ variant: "outline" }), "mt-3")} />}>Drive with us</SheetClose>
        <SheetClose render={<Link href="/login" className={buttonVariants({ variant: "outline" })} />}>Log in</SheetClose>
        <SheetClose render={<Link href="/book" className={buttonVariants()} />}>Book a ride</SheetClose>
      </>
    );
  }

  return (
    <>
      <div className="mt-3 border-t px-3 pb-1 pt-4">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <SheetClose render={<Link href={user.path} className={buttonVariants()} />}>Dashboard</SheetClose>
      {user.role === "customer" && <SheetClose render={<Link href="/book" className={buttonVariants({ variant: "outline" })} />}>Book a ride</SheetClose>}
      <form action={logout}>
        <SheetClose render={<button type="submit" className={cn(buttonVariants({ variant: "ghost" }), "w-full")} />}>Log out</SheetClose>
      </form>
    </>
  );
}

/** The hero's driver call to action, shown only to signed-out visitors. */
export async function HeroDriveAction() {
  if (await getSessionUser()) return null;
  return (
    <Link href="/drivers/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "group h-12 gap-2 rounded-full px-6")}>
      Drive with {BRAND.name}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
