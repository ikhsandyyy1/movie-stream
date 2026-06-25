# IMOV MVP

Movie streaming catalog MVP built with Next.js and prepared for Supabase Auth, Postgres, and Storage.

## Features

- Dark cinematic UI with responsive home rails, catalog, ranking, detail, player, login, and admin pages.
- Mock content data in `lib/data.ts` so the app can run before Supabase is connected.
- Supabase schema and RLS policies in `lib/supabase/schema.sql`.
- Video source model supports owned videos, official embeds, and licensed providers.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill the public URL and anon key.
3. Run `lib/supabase/schema.sql` in Supabase SQL Editor.
4. Create storage buckets for posters, backdrops, subtitles, and owned videos.
5. Replace `lib/data.ts` reads with Supabase queries once auth and admin CRUD are wired.

## Legal Boundary

The app is structured for owned content, official embeds, and licensed providers. Do not scrape or mirror third-party video sources without explicit rights.
