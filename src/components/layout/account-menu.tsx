"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { logout } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export const initialsOf = (name: string) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const item = "flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

export function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Account menu, ${user.name}, ${user.label}`}
        className="flex h-11 items-center gap-2 rounded-full border bg-background pl-1.5 pr-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initialsOf(user.name)}</span>
        <span className="hidden text-sm font-medium lg:inline">{user.label}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-60 gap-1 rounded-2xl p-2">
        <div className="px-2.5 pb-2 pt-1.5">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Link href={user.path} onClick={() => setOpen(false)} className={item}>
          <LayoutDashboard aria-hidden className="size-4 text-muted-foreground" />Dashboard
        </Link>
        <form action={logout}>
          <button type="submit" className={item}>
            <LogOut aria-hidden className="size-4 text-muted-foreground" />Log out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
