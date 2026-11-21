import type { Role } from "@/lib/auth/roles";
import { estimateFare } from "@/lib/mock/fare";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";
import type { VehicleCategoryId } from "@/types";

/** SAMPLE DATA for the demo dashboards. Nothing here is a real person, ride, vehicle or payment. */
export type IconName =
  | "car" | "calendar" | "card" | "receipt" | "briefcase" | "list" | "wallet" | "file" | "clock" | "users" | "chart" | "shield" | "scroll" | "overview";

export type DashboardRow = { title: string; meta: string; value?: string; status?: string };
export type DashboardSection = { title: string; rows: DashboardRow[] };
export type DashboardStat = { k: string; v: string };
export type DashboardChart = { title: string; caption: string; prefix?: string; bars: { label: string; value: number }[] };
export type PanelData = { title: string; text: string; stats: DashboardStat[]; chart?: DashboardChart; sections: DashboardSection[] };

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
  action?: { label: string; done: string };
};

export type FilterGroup = { key: string; label: string; kind: "checks" | "pills" };

export type WorkspaceData = {
  noun: string;
  priceLabel: string;
  items: WorkItem[];
  filters: FilterGroup[];
  favourites?: boolean;
  closestLabel: string;
};

export type DashboardConfig = {
  nav: { id: string; label: string; icon: IconName }[];
  workspace: WorkspaceData;
  panels: Record<string, PanelData>;
};

const PAINT = { pearl: "#e9e9e4", graphite: "#34373c", silver: "#a9adb2", onyx: "#1e2024", lime: "#a3e635", forest: "#2f5d46", ember: "#a23b2d", ocean: "#2f5f8f" };
const cat = (id: VehicleCategoryId) => VEHICLE_CATEGORIES.find((c) => c.id === id)!;

const RIDER_VEHICLES: [string, VehicleCategoryId, string, string, number, number, number, number][] = [
  ["City Hatch", "economy", PAINT.ocean, "Hybrid · automatic", 4.7, 209, 0.3, 4],
  ["Metro Compact", "economy", PAINT.pearl, "Fuel saver · automatic", 4.5, 164, 0.6, 5],
  ["Urban Sedan", "comfort", PAINT.silver, "Quiet cabin · extra legroom", 4.8, 318, 0.4, 6],
  ["Cruise Sedan", "comfort", PAINT.forest, "Hybrid · climate control", 4.9, 142, 0.9, 7],
  ["Executive Sedan", "premium", PAINT.onyx, "Leather · top-rated driver", 4.9, 266, 0.7, 8],
  ["Business Sedan", "premium", PAINT.ember, "Wi-Fi · top-rated driver", 4.7, 118, 1.2, 9],
  ["Trail SUV", "suv", PAINT.forest, "All-wheel drive · 3 rows", 4.8, 221, 0.8, 10],
  ["Family SUV", "suv", PAINT.pearl, "3 rows · large trunk", 4.6, 187, 1.4, 11],
  ["Grand Tourer", "luxury", PAINT.graphite, "Chauffeur · rear lounge", 5, 96, 1.6, 12],
  ["Signature Limo", "luxury", PAINT.onyx, "Chauffeur · privacy glass", 4.9, 74, 2.1, 13],
  ["Group Van", "van", PAINT.silver, "8 seats · luggage bay", 4.6, 133, 1.1, 14],
  ["Shuttle Van", "van", PAINT.ocean, "8 seats · step assist", 4.7, 89, 1.8, 15],
];

const riderItems: WorkItem[] = RIDER_VEHICLES.map(([title, id, tint, subtitle, rating, reviews, distance, trip]) => {
  const c = cat(id);
  return {
    id: title.toLowerCase().replace(/\s+/g, "-"),
    title, subtitle, vehicle: id, tint, rating, reviews, distance,
    meta: `${distance} mi · ${Math.max(2, Math.round(distance * 5))} min`,
    price: estimateFare(c, trip, Math.round(trip * 2.4)),
    unit: `est. ${trip} mi`,
    facets: { Class: c.name, Seats: `${c.passengers} seats`, Luggage: c.luggage >= 5 ? "Large" : c.luggage >= 3 ? "Medium" : "Small" },
    href: `/book?categoryId=${id}`,
  };
});

const job = (id: string, title: string, when: string, vehicle: VehicleCategoryId, tint: string, type: string, miles: number, pay: number): WorkItem => ({
  id, title, subtitle: when, vehicle, tint, price: pay, unit: "pay", distance: miles,
  meta: `${miles} mi trip`, status: "New",
  facets: { "Ride type": type, Class: cat(vehicle).name },
  action: { label: "Accept", done: "Accepted" },
});

const fleet = (id: string, vehicle: VehicleCategoryId, tint: string, status: string, driver: string, revenue: number, rating: number): WorkItem => ({
  id, title: `${cat(vehicle).name} · ${id}`, subtitle: driver, vehicle, tint, status, rating,
  price: revenue, unit: "/ month", distance: revenue, meta: "Sample vehicle",
  facets: { Class: cat(vehicle).name, Status: status },
});

const queue = (id: string, title: string, subtitle: string, vehicle: VehicleCategoryId, tint: string, type: string, status: string, value: number): WorkItem => ({
  id, title: `${title} #${id}`, subtitle, vehicle, tint, status, price: value, unit: "fare", distance: value, meta: type,
  facets: { Type: type, Status: status },
  action: status === "Disputed" || status === "Review" ? { label: "Resolve", done: "Resolved" } : undefined,
});

export const DASHBOARDS: Record<Role, DashboardConfig> = {
  customer: {
    nav: [
      { id: "vehicles", label: "Vehicles", icon: "car" },
      { id: "rides", label: "My rides", icon: "calendar" },
      { id: "payments", label: "Payments", icon: "card" },
      { id: "receipts", label: "Receipts", icon: "receipt" },
    ],
    workspace: {
      noun: "vehicles to book", priceLabel: "Estimated fare", items: riderItems, favourites: true, closestLabel: "Closest to me",
      filters: [{ key: "Class", label: "Vehicle class", kind: "checks" }, { key: "Seats", label: "Seats", kind: "pills" }, { key: "Luggage", label: "Luggage", kind: "pills" }],
    },
    panels: {
      rides: { title: "My rides", text: "Your upcoming and past trips.", stats: [{ k: "2", v: "upcoming rides" }, { k: "14", v: "completed rides" }, { k: "4.9", v: "rating you gave" }], sections: [
        { title: "Upcoming", rows: [{ title: "Downtown to Airport", meta: "Mon, Dec 1 · 8:30 AM · Comfort", status: "Confirmed" }, { title: "Home to Convention Center", meta: "Thu, Dec 4 · 5:15 PM · Premium", status: "Driver assigned" }] },
        { title: "Past rides", rows: [{ title: "Airport to Downtown", meta: "Nov 14 · Economy", value: "$38.40", status: "Paid" }, { title: "Office to Home", meta: "Nov 9 · Comfort", value: "$24.10", status: "Paid" }, { title: "Home to Stadium", meta: "Nov 2 · SUV", value: "$41.75", status: "Paid" }] },
      ] },
      payments: { title: "Payments", text: "You are only charged after a ride is complete.", stats: [{ k: "$412", v: "spent this year" }, { k: "$0", v: "currently due" }, { k: "$58", v: "tips given" }],
        chart: { title: "Monthly ride spend", caption: "Last 6 months", prefix: "$", bars: [{ label: "Jun", value: 46 }, { label: "Jul", value: 72 }, { label: "Aug", value: 58 }, { label: "Sep", value: 84 }, { label: "Oct", value: 67 }, { label: "Nov", value: 85 }] },
        sections: [{ title: "Payment method", rows: [{ title: "Sample card", meta: "No real card is stored in demo mode", status: "Default" }] }] },
      receipts: { title: "Receipts", text: "Every completed ride, itemized.", stats: [{ k: "14", v: "receipts" }, { k: "$29", v: "average ride" }, { k: "$412", v: "total this year" }], sections: [
        { title: "Recent receipts", rows: [{ title: "Receipt DEMO-1042", meta: "Nov 14 · Airport to Downtown", value: "$38.40", status: "Paid" }, { title: "Receipt DEMO-1039", meta: "Nov 9 · Office to Home", value: "$24.10", status: "Paid" }, { title: "Receipt DEMO-1031", meta: "Nov 2 · Home to Stadium", value: "$41.75", status: "Paid" }] },
      ] },
    },
  },
  driver: {
    nav: [
      { id: "jobs", label: "Available jobs", icon: "briefcase" },
      { id: "mine", label: "My jobs", icon: "list" },
      { id: "earnings", label: "Earnings", icon: "wallet" },
      { id: "documents", label: "Documents", icon: "file" },
      { id: "availability", label: "Availability", icon: "clock" },
    ],
    workspace: {
      noun: "jobs available", priceLabel: "Pay", closestLabel: "Shortest trip",
      items: [
        job("j1", "Midtown to Airport", "Today · 6:00 PM", "comfort", PAINT.silver, "Airport", 14, 32),
        job("j2", "University to Downtown", "Tomorrow · 9:15 AM", "economy", PAINT.ocean, "City", 6, 16.5),
        job("j3", "Hotel District to Stadium", "Tomorrow · 1:30 PM", "premium", PAINT.onyx, "Event", 9, 27.25),
        job("j4", "Riverside to Airport", "Tomorrow · 4:45 PM", "suv", PAINT.forest, "Airport", 18, 46),
        job("j5", "Old Town to Convention Center", "Dec 2 · 8:00 AM", "comfort", PAINT.pearl, "City", 5, 14.75),
        job("j6", "Lakeside to Downtown", "Dec 2 · 11:20 AM", "van", PAINT.silver, "Group", 12, 38.5),
        job("j7", "Airport to Harbor Hotel", "Dec 3 · 7:10 AM", "luxury", PAINT.graphite, "Airport", 16, 64),
        job("j8", "Market Street to Arena", "Dec 3 · 6:30 PM", "economy", PAINT.pearl, "Event", 4, 12.25),
        job("j9", "Campus to Train Station", "Dec 4 · 10:00 AM", "van", PAINT.ocean, "Group", 8, 29),
      ],
      filters: [{ key: "Ride type", label: "Ride type", kind: "checks" }, { key: "Class", label: "Vehicle class", kind: "checks" }],
    },
    panels: {
      mine: { title: "My jobs", text: "Rides you have accepted.", stats: [{ k: "2", v: "upcoming jobs" }, { k: "86", v: "completed jobs" }, { k: "4.9", v: "average rating" }], sections: [
        { title: "Upcoming", rows: [{ title: "Hotel District to Airport", meta: "Tomorrow · 7:00 AM", value: "$29.00", status: "Confirmed" }, { title: "Downtown to Riverside", meta: "Dec 2 · 4:45 PM", value: "$21.25", status: "Confirmed" }] },
      ] },
      earnings: { title: "Earnings", text: "Your pay and tips. 100% of tips go to you.", stats: [{ k: "$1,284", v: "earned this month" }, { k: "$186", v: "tips this month" }, { k: "$420", v: "next payout" }],
        chart: { title: "Weekly earnings", caption: "Last 8 weeks", prefix: "$", bars: [{ label: "W1", value: 248 }, { label: "W2", value: 312 }, { label: "W3", value: 286 }, { label: "W4", value: 354 }, { label: "W5", value: 298 }, { label: "W6", value: 376 }, { label: "W7", value: 332 }, { label: "W8", value: 412 }] },
        sections: [{ title: "Payouts", rows: [{ title: "Next payout", meta: "Scheduled Dec 1", value: "$420.00", status: "Pending" }, { title: "Last payout", meta: "Nov 24", value: "$388.50", status: "Paid" }] }] },
      documents: { title: "Documents", text: "Keep these current to stay eligible for jobs.", stats: [{ k: "3", v: "approved" }, { k: "0", v: "need attention" }, { k: "1", v: "active vehicle" }], sections: [
        { title: "Your documents", rows: [{ title: "Driver's license", meta: "Expires Aug 2028", status: "Approved" }, { title: "Background check", meta: "Completed Oct 2026", status: "Approved" }, { title: "Vehicle assignment", meta: "Sample Fleet · Comfort", status: "Active" }] },
      ] },
      availability: { title: "Availability", text: "When you are open to receive jobs.", stats: [{ k: "55", v: "hours per week" }, { k: "5", v: "active days" }, { k: "1", v: "service area" }], sections: [
        { title: "Weekly schedule", rows: [{ title: "Weekdays", meta: "7:00 AM to 6:00 PM", status: "On" }, { title: "Weekends", meta: "Not set", status: "Off" }] },
      ] },
    },
  },
  provider: {
    nav: [
      { id: "fleet", label: "Fleet", icon: "car" },
      { id: "drivers", label: "Drivers", icon: "users" },
      { id: "bookings", label: "Bookings", icon: "calendar" },
      { id: "revenue", label: "Revenue", icon: "chart" },
    ],
    workspace: {
      noun: "vehicles in your fleet", priceLabel: "Monthly revenue", closestLabel: "Top earners",
      items: [
        fleet("DEMO-101", "comfort", PAINT.silver, "Active", "Driver A", 2140, 4.8),
        fleet("DEMO-204", "suv", PAINT.forest, "Active", "Driver B", 3280, 4.9),
        fleet("DEMO-318", "van", PAINT.pearl, "Inspection due", "Driver C", 2460, 4.6),
        fleet("DEMO-422", "economy", PAINT.ocean, "Active", "Driver D", 1320, 4.7),
        fleet("DEMO-507", "premium", PAINT.onyx, "Active", "Driver E", 2890, 4.9),
        fleet("DEMO-613", "luxury", PAINT.graphite, "Active", "Driver F", 4120, 5),
        fleet("DEMO-720", "economy", PAINT.pearl, "Unassigned", "No driver assigned", 640, 4.5),
        fleet("DEMO-834", "comfort", PAINT.ember, "Inspection due", "Driver G", 1760, 4.6),
        fleet("DEMO-941", "suv", PAINT.silver, "Unassigned", "No driver assigned", 980, 4.7),
      ],
      filters: [{ key: "Status", label: "Status", kind: "checks" }, { key: "Class", label: "Vehicle class", kind: "checks" }],
    },
    panels: {
      drivers: { title: "Drivers", text: "Assignments across your fleet.", stats: [{ k: "7", v: "assigned drivers" }, { k: "2", v: "open vehicles" }, { k: "1", v: "invitation pending" }], sections: [
        { title: "Assignments", rows: [{ title: "Driver A", meta: "DEMO-101 · Comfort", status: "Active" }, { title: "Driver B", meta: "DEMO-204 · SUV", status: "Active" }, { title: "Driver C", meta: "DEMO-318 · Van", status: "Review" }, { title: "Driver H", meta: "Invitation sent", status: "Pending" }] },
      ] },
      bookings: { title: "Bookings", text: "Rides running on your vehicles.", stats: [{ k: "6", v: "today" }, { k: "41", v: "this week" }, { k: "98%", v: "completion rate" }], sections: [
        { title: "Today", rows: [{ title: "Airport transfer", meta: "3:30 PM · DEMO-204", value: "$44.00", status: "Confirmed" }, { title: "City ride", meta: "5:00 PM · DEMO-101", value: "$19.75", status: "Driver assigned" }] },
      ] },
      revenue: { title: "Revenue", text: "You receive 80% of completed ride revenue, less adjustments.", stats: [{ k: "$19.6k", v: "gross this month" }, { k: "$15.7k", v: "your 80% share" }, { k: "$3,240", v: "next payout" }],
        chart: { title: "Monthly gross revenue", caption: "Last 6 months", prefix: "$", bars: [{ label: "Jun", value: 12400 }, { label: "Jul", value: 14100 }, { label: "Aug", value: 13650 }, { label: "Sep", value: 16200 }, { label: "Oct", value: 17850 }, { label: "Nov", value: 19590 }] },
        sections: [{ title: "Payouts", rows: [{ title: "Next payout", meta: "Scheduled Dec 1", value: "$3,240", status: "Pending" }, { title: "Last payout", meta: "Nov 24", value: "$3,015", status: "Paid" }] }] },
    },
  },
  admin: {
    nav: [
      { id: "queue", label: "Bookings queue", icon: "list" },
      { id: "overview", label: "Overview", icon: "overview" },
      { id: "verification", label: "Verification", icon: "shield" },
      { id: "payments", label: "Payments", icon: "wallet" },
      { id: "audit", label: "Audit log", icon: "scroll" },
    ],
    workspace: {
      noun: "bookings in queue", priceLabel: "Booking value", closestLabel: "Highest value",
      items: [
        queue("B-9021", "Airport transfer", "Downtown to Airport · in progress", "suv", PAINT.forest, "Airport", "Confirmed", 44),
        queue("B-9018", "City ride", "Dispute opened by customer", "economy", PAINT.ocean, "City", "Disputed", 22.3),
        queue("B-9016", "Group ride", "Payment awaiting capture", "van", PAINT.silver, "Group", "Pending", 58.75),
        queue("B-9012", "Airport transfer", "Fare adjustment requested", "premium", PAINT.onyx, "Airport", "Review", 71.2),
        queue("B-9009", "City ride", "Driver on the way", "comfort", PAINT.pearl, "City", "Confirmed", 19.75),
        queue("B-9005", "Event ride", "Refund requested", "luxury", PAINT.graphite, "Event", "Review", 128),
        queue("B-9002", "Group ride", "Scheduled for tomorrow", "van", PAINT.ocean, "Group", "Confirmed", 64.5),
        queue("B-8998", "Event ride", "Dispute opened by driver", "suv", PAINT.silver, "Event", "Disputed", 83.4),
        queue("B-8994", "City ride", "Payment awaiting capture", "comfort", PAINT.ember, "City", "Pending", 26.1),
      ],
      filters: [{ key: "Status", label: "Status", kind: "checks" }, { key: "Type", label: "Ride type", kind: "checks" }],
    },
    panels: {
      overview: { title: "Platform overview", text: "How the marketplace is running.", stats: [{ k: "1,248", v: "bookings this month" }, { k: "37", v: "awaiting verification" }, { k: "$96k", v: "gross ride volume" }],
        chart: { title: "Monthly bookings", caption: "Last 6 months", bars: [{ label: "Jun", value: 742 }, { label: "Jul", value: 856 }, { label: "Aug", value: 921 }, { label: "Sep", value: 1034 }, { label: "Oct", value: 1162 }, { label: "Nov", value: 1248 }] },
        sections: [{ title: "Needs attention", rows: [{ title: "Open disputes", meta: "Safety and disputes", value: "2", status: "Disputed" }, { title: "Expiring insurance", meta: "Next 30 days", value: "5", status: "Review" }] }] },
      verification: { title: "Verification", text: "Applications waiting for a compliance decision.", stats: [{ k: "37", v: "in queue" }, { k: "12", v: "approved today" }, { k: "1.4d", v: "average review" }], sections: [
        { title: "Queue", rows: [{ title: "Driver application #D-2041", meta: "License and background check", status: "Review" }, { title: "Fleet application #F-318", meta: "Insurance certificate", status: "Review" }, { title: "Vehicle DEMO-318", meta: "Inspection report", status: "Pending" }] },
      ] },
      payments: { title: "Payments", text: "Money captured and paid out.", stats: [{ k: "$4,920", v: "captured today" }, { k: "$3,870", v: "payouts scheduled" }, { k: "$612", v: "tips today" }],
        chart: { title: "Daily captured payments", caption: "Last 7 days", prefix: "$", bars: [{ label: "Sat", value: 5240 }, { label: "Sun", value: 4380 }, { label: "Mon", value: 3920 }, { label: "Tue", value: 4110 }, { label: "Wed", value: 4560 }, { label: "Thu", value: 4780 }, { label: "Fri", value: 4920 }] },
        sections: [{ title: "Payout batches", rows: [{ title: "Drivers", meta: "Scheduled Dec 1", value: "$2,140", status: "Pending" }, { title: "Providers", meta: "Scheduled Dec 1", value: "$1,730", status: "Pending" }] }] },
      audit: { title: "Audit log", text: "Sensitive changes, recorded in order.", stats: [{ k: "24", v: "events today" }, { k: "3", v: "financial changes" }, { k: "0", v: "failed checks" }], sections: [
        { title: "Recent activity", rows: [{ title: "Commission rule viewed", meta: "Demo Admin · 2 hours ago" }, { title: "Driver #D-2038 approved", meta: "Demo Admin · yesterday", status: "Approved" }, { title: "Vehicle DEMO-204 approved", meta: "Demo Admin · yesterday", status: "Approved" }] },
      ] },
    },
  },
};
