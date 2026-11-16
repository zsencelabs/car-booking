import { CalendarCheck, CarFront, MapPin, ShieldCheck, Star, Wallet } from "lucide-react";

export const HOW_IT_WORKS = [
  { icon: MapPin, title: "Tell us where", text: "Enter your pickup, destination, date and time." },
  { icon: CarFront, title: "Pick your ride", text: "Compare vehicle categories and see upfront estimates." },
  { icon: CalendarCheck, title: "Get confirmed", text: "A verified driver and vehicle are assigned to your booking." },
  { icon: Wallet, title: "Pay after the ride", text: "Your card is only charged once the trip is completed." },
  { icon: Star, title: "Rate & tip", text: "Rate the driver and vehicle separately and add an optional tip." },
] as const;

export const SAFETY_FEATURES = [
  { icon: ShieldCheck, title: "Verified drivers", text: "Identity, license, driving record and background checks before any ride." },
  { icon: CarFront, title: "Approved vehicles", text: "Registration, insurance and inspection documents are tracked and monitored for expiry." },
  { icon: MapPin, title: "See details first", text: "Driver and vehicle information is visible to you before your pickup." },
  { icon: Star, title: "Emergency & reporting", text: "Support is reachable during rides, and any safety issue becomes a trackable case." },
] as const;

/** Sample placeholder quotes — replace with real customer, driver and provider reviews before launch. */
export const TESTIMONIALS = [
  { name: "Sarah M.", role: "Customer", text: "Booked an SUV for the family in under a minute. Driver was on time and the car spotless." },
  { name: "James R.", role: "Driver", text: "I can browse jobs that fit my area and vehicle, and tips show up clearly in my earnings." },
  { name: "Metro Limo Co.", role: "Fleet provider", text: "Managing vehicles and drivers in one place has made our operation far easier." },
  { name: "Priya K.", role: "Customer", text: "I scheduled my airport ride the night before and knew exactly who was picking me up." },
  { name: "Daniel O.", role: "Driver", text: "Every tip goes straight to me, and I can see it separately from my ride pay." },
  { name: "Bayline Transit", role: "Fleet provider", text: "We see our share the moment a ride completes. No chasing spreadsheets at month end." },
  { name: "Marcus T.", role: "Customer", text: "Nothing was charged until I got out of the car. That alone made me switch." },
  { name: "Elena V.", role: "Driver", text: "The checks took a few days, but riders trust you more because everyone goes through them." },
  { name: "Grace L.", role: "Customer", text: "Seeing the driver's name, plate and rating before pickup makes late rides feel safe." },
] as const;

export const FAQS = [
  { q: "When am I charged?", a: "You pay after the ride is completed. A card authorization may be placed before the ride as a safeguard, but it is not the final charge." },
  { q: "Can I schedule a ride in advance?", a: "Yes. Choose immediate or scheduled booking, and one-way or round-trip." },
  { q: "How are drivers verified?", a: "Drivers submit identity and license documents and complete background and driving-record checks before they can accept jobs." },
  { q: "How do tips work?", a: "Tips are optional, recorded separately from the fare, and go to your driver." },
  { q: "Can I cancel a booking?", a: "Yes. Cancellations follow the platform's cancellation and refund policy shown at booking." },
  { q: "I want to drive or list my fleet. How do I start?", a: "Use the Drive with us or Register your fleet pages to begin onboarding and document verification." },
] as const;

/* ---------- Landing page ---------- */

export const TRUST_FACTS = [
  "Pay after your ride",
  "100% of tips go to drivers",
  "Background-checked drivers",
  "Insured, inspected vehicles",
  "Ride now or schedule ahead",
  "One-way or round-trip",
  "Six vehicle classes",
  "Upfront fare estimates",
] as const;

/** Mirrors the customer-visible subset of booking statuses (PRD §4.3). */
export const LIFECYCLE_STEPS = [
  { status: "Searching for provider", title: "You request, we match", text: "Pickup, destination and time go out to eligible, verified drivers with an approved vehicle in the category you chose." },
  { status: "Driver assigned", title: "A real person confirms", text: "A driver accepts. You see their name, rating, vehicle, plate and color before they set off." },
  { status: "Driver on the way", title: "Track them in", text: "Live status from acceptance to arrival — no guessing, no refreshing." },
  { status: "Ride in progress", title: "Verified pickup", text: "The ride starts only after your pickup is verified, so you always get into the right car." },
  { status: "Paid", title: "Charged when it's done", text: "Your card is charged after the ride is completed. Rate the driver and vehicle separately, tip if you like." },
] as const;

export const VERIFICATION_CHECKS = [
  { group: "Driver", items: ["Government ID", "Driver's license", "Driving record", "Background check"] },
  { group: "Vehicle", items: ["Registration", "Insurance policy", "Inspection"] },
  { group: "Provider", items: ["Business registration", "Tax documents", "Commercial insurance"] },
] as const;

export const DRIVER_JOBS = [
  { from: "SFO Terminal 2", to: "Union Square", miles: 13.8, mins: 28, pay: 41.2, type: "Scheduled · 6:40 PM" },
  { from: "Mission Bay", to: "Palo Alto", miles: 31.5, mins: 44, pay: 68.5, type: "Immediate" },
  { from: "Oakland Coliseum", to: "Berkeley", miles: 9.2, mins: 19, pay: 24.8, type: "Round-trip" },
] as const;

export const FLEET_ROWS = [
  { vehicle: "Tahoe · 8KZM214", category: "SUV", driver: "J. Rivera", status: "On trip" },
  { vehicle: "Camry · 7LPQ903", category: "Comfort", driver: "A. Chen", status: "Available" },
  { vehicle: "S-Class · 9BDX551", category: "Luxury", driver: "—", status: "Unassigned" },
] as const;
