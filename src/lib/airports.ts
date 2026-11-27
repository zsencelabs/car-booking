/** Rides are picked up only at these Southern California airports. Coordinates are the terminal areas, used to price the ride. */
export type Airport = { code: string; name: string; city: string; address: string; lat: number; lng: number };

export const AIRPORTS: Airport[] = [
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", address: "1 World Way, Los Angeles, CA 90045", lat: 33.9416, lng: -118.4085 },
  { code: "SAN", name: "San Diego International Airport", city: "San Diego", address: "Harbor Island Dr, San Diego, CA 92101", lat: 32.7338, lng: -117.1933 },
  { code: "SNA", name: "John Wayne Airport", city: "Santa Ana", address: "18601 Airport Way, Santa Ana, CA 92707", lat: 33.6762, lng: -117.8675 },
  { code: "BUR", name: "Hollywood Burbank Airport", city: "Burbank", address: "2827 N Hollywood Way, Burbank, CA 91505", lat: 34.1975, lng: -118.3585 },
  { code: "ONT", name: "Ontario International Airport", city: "Ontario", address: "2222 International Way, Ontario, CA 91761", lat: 34.056, lng: -117.6012 },
  { code: "LGB", name: "Long Beach Airport", city: "Long Beach", address: "4100 Donald Douglas Dr, Long Beach, CA 90808", lat: 33.8177, lng: -118.1516 },
  { code: "PSP", name: "Palm Springs International Airport", city: "Palm Springs", address: "3400 E Tahquitz Canyon Way, Palm Springs, CA 92262", lat: 33.8297, lng: -116.5067 },
  { code: "SBA", name: "Santa Barbara Airport", city: "Santa Barbara", address: "500 James Fowler Rd, Santa Barbara, CA 93117", lat: 34.4262, lng: -119.8404 },
];

export const airportByCode = (code?: string | null) => (code ? AIRPORTS.find((a) => a.code === code.toUpperCase()) : undefined);

/** The pickup address sent to the API and shown on the ride. */
export const airportAddress = (a: Airport) => `${a.name} (${a.code}), ${a.address}`;

/** Airports whose code, name or city match the typed text. */
export function searchAirports(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return AIRPORTS;
  return AIRPORTS.filter((a) => [a.code, a.name, a.city].some((v) => v.toLowerCase().includes(s)));
}
