/** Single source of truth for brand + navigation. Rename the brand here only. */
export const BRAND = {
  name: "dropoff",
  tagline: "Book reliable rides from verified drivers and fleets.",
  supportEmail: "support@example.com",
  supportPhone: "+1 (555) 010-0100",
  market: "United States",
} as const;

export const MAIN_NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/categories", label: "Vehicles" },
  { href: "/safety", label: "Safety" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_NAV = {
  Company: [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
    { href: "/help", label: "Help center" },
  ],
  Ride: [
    { href: "/book", label: "Book a ride" },
    { href: "/categories", label: "Vehicle categories" },
    { href: "/safety", label: "Safety" },
  ],
  Partner: [
    { href: "/drivers/register", label: "Drive with us" },
    { href: "/providers/register", label: "Register your fleet" },
  ],
  Legal: [
    { href: "/terms", label: "Terms & conditions" },
    { href: "/privacy", label: "Privacy policy" },
  ],
} as const;
