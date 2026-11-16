import type { VehicleCategory } from "@/types";

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  { id: "economy", name: "Economy", description: "Affordable everyday rides for up to 4.", passengers: 4, luggage: 2, baseFare: 3.5, perMile: 1.45, perMinute: 0.3, examples: "Toyota Corolla, Honda Civic", eta: "3 min" },
  { id: "comfort", name: "Comfort", description: "Newer cars with extra legroom and quiet cabins.", passengers: 4, luggage: 3, baseFare: 5, perMile: 1.85, perMinute: 0.38, examples: "Toyota Camry, Hyundai Sonata", eta: "5 min" },
  { id: "premium", name: "Premium", description: "Top-rated drivers in high-end sedans.", passengers: 4, luggage: 3, baseFare: 8, perMile: 2.6, perMinute: 0.5, examples: "BMW 5 Series, Audi A6", eta: "6 min" },
  { id: "suv", name: "SUV", description: "Spacious rides for groups and extra luggage.", passengers: 6, luggage: 5, baseFare: 9, perMile: 2.9, perMinute: 0.55, examples: "Chevrolet Tahoe, Toyota Highlander", eta: "7 min" },
  { id: "luxury", name: "Luxury", description: "Chauffeur-class experience for special occasions.", passengers: 3, luggage: 3, baseFare: 15, perMile: 4.2, perMinute: 0.8, examples: "Mercedes S-Class, Cadillac Escalade", eta: "10 min" },
  { id: "van", name: "Van", description: "Large groups of up to 8 with room for bags.", passengers: 8, luggage: 8, baseFare: 12, perMile: 3.2, perMinute: 0.6, examples: "Chrysler Pacifica, Mercedes Sprinter", eta: "12 min" },
];
