import type { VehicleCategoryId } from "@/types";

/** What each dashboard shows, built on the server from the API for the signed-in user. */
export type IconName =
  | "car" | "calendar" | "card" | "receipt" | "briefcase" | "list" | "wallet" | "file" | "clock" | "users" | "chart" | "shield" | "scroll" | "overview" | "plus" | "mail" | "building";

/** A change the dashboard can ask the server to make. See lib/dashboards/actions.ts. */
export type Op =
  | { kind: "job.accept"; id: string }
  | { kind: "job.status"; id: string; status: "DRIVER_EN_ROUTE" | "DRIVER_ARRIVED" | "IN_PROGRESS" | "COMPLETED" }
  | { kind: "job.release"; id: string }
  | { kind: "vehicle.availability"; id: string; status: "AVAILABLE" | "TEMPORARILY_UNAVAILABLE" | "MAINTENANCE" }
  | { kind: "invite.revoke"; id: string }
  | { kind: "assignment.end"; id: string }
  | { kind: "verify"; entity: "drivers" | "providers" | "vehicles"; id: string; decision: "APPROVED" | "REJECTED" | "SUSPENDED" }
  | { kind: "user.status"; id: string; status: "ACTIVE" | "SUSPENDED" };

export type RowAction = {
  label: string;
  op: Op;
  tone?: "primary" | "danger";
  /** Ask for a note first (e.g. a rejection reason). */
  ask?: string;
};

export type DashboardRow = { id: string; title: string; meta: string; value?: string; status?: string; href?: string; actions?: RowAction[] };
export type DashboardSection = { title: string; rows: DashboardRow[]; empty?: string };
export type DashboardStat = { k: string; v: string };
export type DashboardChart = { title: string; caption: string; prefix?: string; bars: { label: string; value: number }[] };

/** Forms a panel can show. */
export type PanelForm =
  | { type: "invite" }
  | { type: "invite-code" }
  | { type: "assign"; vehicles: { id: string; label: string }[]; drivers: { id: string; label: string }[] }
  | { type: "compensation"; percent: number | null }
  | { type: "license"; licenseNumber: string; licenseState: string; licenseExpiresAt: string }
  | { type: "vehicle"; categories: { id: string; name: string; passengers: number }[] }
  | { type: "pricing"; categories: PricingCategory[] };

/** A vehicle class's fare settings, in cents. */
export type PricingCategory = { id: string; name: string; active: boolean; baseFareCents: number; minimumFareCents: number; perKmBandCents: number[] };

export type PanelData = {
  title: string;
  text: string;
  /** A notice above the panel, e.g. what is still needed for approval. */
  notice?: string;
  stats: DashboardStat[];
  chart?: DashboardChart;
  forms?: PanelForm[];
  sections: DashboardSection[];
};

export type WorkItem = {
  id: string;
  title: string;
  subtitle: string;
  vehicle: VehicleCategoryId;
  tint: string;
  price: number;
  unit: string;
  distance: number;
  meta: string;
  rating?: number;
  reviews?: number;
  status?: string;
  facets: Record<string, string>;
  href?: string;
  action?: { label: string; done: string; op: Op };
};

export type FilterGroup = { key: string; label: string; kind: "checks" | "pills" };

export type WorkspaceData = {
  noun: string;
  priceLabel: string;
  items: WorkItem[];
  filters: FilterGroup[];
  favourites?: boolean;
  closestLabel: string;
  notice?: string;
  empty: { title: string; text: string; href?: string; cta?: string };
};

export type DashboardConfig = {
  nav: { id: string; label: string; icon: IconName }[];
  workspace: WorkspaceData;
  panels: Record<string, PanelData>;
};
