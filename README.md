# dropoff website

The Next.js site for the dropoff car booking marketplace. Riders book rides, drivers take jobs, fleets manage vehicles and drivers, and admins verify everyone. All data comes from the dropoff API (`car-booking-backend`).

## Setup

1. Start the API first (see `car-booking-backend/README.md`). It runs on http://localhost:4000.
2. Copy `.env.example` to `.env.local` and fill it in:
   - `API_URL`: where the API runs (server-side only).
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: a public Mapbox token for address search. Without it, rides can't be booked because the API needs map coordinates for pickup and drop-off.
3. `npm install`, then `npm run dev` and open http://localhost:3000.

Sign in with the API's seeded demo accounts (password `dropoff-demo-2026`): `alex@customer.test`, `maria@drivers.test`, `owner@metrocar.test`, `admin@dropoff.test`.

## How it talks to the API

- **Sessions:** logging in stores the API's access token (15 minutes) and refresh token (30 days) in httpOnly cookies. The browser never sees them. `src/proxy.ts` swaps an expired access token for a new pair before any page or Server Action runs. Refreshes are shared between concurrent requests, because the API ends the whole session if a refresh token is used twice.
- **Data:** pages and Server Actions call the API from the server with `api()` (`src/lib/api/server.ts`). Each dashboard is built per role on the server (`src/lib/dashboards/load.ts`), so a browser only receives its own user's data.
- **Prices:** the API quotes every fare. The site never computes a price; it passes the signed quote back when booking.

## Not built yet

These need backend work first: online payments and payouts, tips, ratings, document uploads, email (driver invitations show a one-time code to pass on instead), password reset, and live maps.

The marketing pages (home, vehicle classes, help) use static copy in `src/lib/mock/`, so their rate card isn't read from the API.
