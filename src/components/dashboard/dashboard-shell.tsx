"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, BarChart3, BriefcaseBusiness, CalendarDays, CarFront, Clock3, CreditCard, FileText, LayoutDashboard, LifeBuoy, ListChecks,
  LogOut, MapPin, Menu, ReceiptText, ScrollText, ShieldCheck, Users, Wallet, type LucideIcon,
} from "lucide-react";
import { EASE } from "@/components/landing/reveal";
import { MotionProvider } from "@/components/landing/motion-provider";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/roles";
import { BRAND } from "@/lib/config";
import { DASHBOARDS, type IconName } from "@/lib/mock/dashboards";
import { cn } from "@/lib/utils";
import { PanelView } from "./panel-view";
import { WorkspaceView } from "./workspace-view";

const ICONS: Record<IconName, LucideIcon> = {
  car: CarFront, calendar: CalendarDays, card: CreditCard, receipt: ReceiptText, briefcase: BriefcaseBusiness, list: ListChecks,
  wallet: Wallet, file: FileText, clock: Clock3, users: Users, chart: BarChart3, shield: ShieldCheck, scroll: ScrollText, overview: LayoutDashboard,
};

const subscribeClock = (tick: () => void) => {
  const timer = setInterval(tick, 15000);
  return () => clearInterval(timer);
};
const readClock = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function LiveClock() {
  const time = useSyncExternalStore(subscribeClock, readClock, () => "");
  return <span className="inline-flex min-w-16 items-center gap-1.5 tabular-nums"><Clock3 aria-hidden className="size-3.5" />{time}</span>;
}

const railItem = "relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50";

function Rail({ user, view, onSelect, layoutId }: { user: SessionUser; view: string; onSelect: (id: string) => void; layoutId: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-3">
      <nav aria-label="Dashboard" className="space-y-1">
        {DASHBOARDS[user.role].nav.map((n, i) => {
          const Icon = ICONS[n.icon];
          const on = view === n.id;
          return (
            <motion.button
              key={n.id} type="button" aria-current={on ? "page" : undefined} onClick={() => onSelect(n.id)}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
              className={cn(railItem, on ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
            >
              {on && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
              <Icon aria-hidden className="relative size-[18px]" />
              <span className="relative truncate">{n.label}</span>
            </motion.button>
          );
        })}
      </nav>
      <div className="space-y-1 border-t pt-3">
        <Link href="/help" className={cn(railItem, "text-muted-foreground hover:bg-muted hover:text-foreground")}><LifeBuoy aria-hidden className="size-[18px]" />Support</Link>
        <Link href="/" className={cn(railItem, "text-muted-foreground hover:bg-muted hover:text-foreground")}><ArrowLeft aria-hidden className="size-[18px]" />Back to site</Link>
        <form action={logout}>
          <button type="submit" className={cn(railItem, "text-muted-foreground hover:bg-muted hover:text-foreground")}><LogOut aria-hidden className="size-[18px]" />Log out</button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({ user }: { user: SessionUser }) {
  const config = DASHBOARDS[user.role];
  const params = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const requested = params.get("view");
  const view = config.nav.some((n) => n.id === requested) ? requested! : config.nav[0].id;
  const isWorkspace = view === config.nav[0].id;

  function select(id: string) {
    setMenuOpen(false);
    if (id !== view) window.history.pushState(null, "", id === config.nav[0].id ? user.path : `${user.path}?view=${id}`);
  }

  return (
    <MotionProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <motion.header
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}
          className="flex h-16 shrink-0 items-center gap-3 border-b px-3 md:px-5"
        >
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open dashboard menu" className="size-10 rounded-full lg:hidden" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 gap-0 p-0">
              <SheetTitle className="px-5 pb-1 pt-5">{user.label}</SheetTitle>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <Rail user={user} view={view} onSelect={select} layoutId="rail-active-mobile" />
              </div>
            </SheetContent>
          </Sheet>
          <div className="lg:w-44"><Logo /></div>
          <div className="hidden items-center gap-5 text-[13px] text-muted-foreground md:flex">
            <LiveClock />
            <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden className="size-3.5" />{BRAND.market}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:inline">Demo · sample data</span>
            <ThemeToggle className="size-10 rounded-full" />
            <AccountMenu user={user} />
          </div>
        </motion.header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-52 shrink-0 border-r lg:block"><Rail user={user} view={view} onSelect={select} layoutId="rail-active" /></aside>
          <main className="flex min-w-0 flex-1 flex-col bg-muted/50">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view} className="flex min-h-0 flex-1 flex-col"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: EASE }}
              >
                {isWorkspace ? <WorkspaceView workspace={config.workspace} /> : <PanelView panel={config.panels[view]} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </MotionProvider>
  );
}
