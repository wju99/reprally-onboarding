Store Onboarding Flow (Next.js + Supabase + Google Places)

Quick start

1) Prereqs
- Node 18+ and PNPM/NPM/Yarn
- Supabase project with the `nj_stores` table imported from the CSV
- Google Maps Platform key with Places API enabled
- (Optional) PostHog project key

2) Environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- NEXT_PUBLIC_POSTHOG_KEY (optional)
- NEXT_PUBLIC_POSTHOG_HOST (optional, defaults to https://us.i.posthog.com)

3) Install and run
- npm install
- npm run dev

Project structure

- app/: App Router pages and layouts
- components/providers/PostHogClientProvider.tsx: PostHog initialization
- lib/supabase/client.ts: Supabase browser client
- tailwind.config.ts, app/globals.css: Tailwind styling

Notes

- Google Places will be used for address autocomplete and to persist place_id + coordinates.
- Insights will query Supabase `public.nj_stores` using coordinates; null-safe computations.

