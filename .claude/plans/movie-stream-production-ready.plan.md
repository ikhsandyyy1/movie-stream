# Plan: Movie Stream — Production Ready

**Source**: Free-form request
**Complexity**: Large

## Summary

Membawa project streaming movie/series MVP ini menjadi **production-ready** melalui 7 fase: (1) infrastruktur & keamanan dasar, (2) error handling & loading states, (3) SEO & metadata, (4) auth & user flow lengkap, (5) performance & caching, (6) testing, (7) monitoring & deployment hardening. Setiap fase bisa diimplementasikan independen dan memberikan nilai produksi yang nyata.

## Current State Assessment

| Area | Status | Gap |
|---|---|---|
| **Frontend** | Dark cinematic UI, RSC, 8 pages, hybrid data | No loading/error boundaries, no metadata per page |
| **Database** | Full schema, RLS, audit, storage buckets | No migration tooling, manual SQL |
| **Auth** | Supabase Auth, middleware, admin check | Login page = 404, no registration, no forgot-password |
| **Admin** | Full CRUD, seasons/episodes, audit log | No toast feedback, no image preview, no validation UX |
| **Data** | Mock + Supabase hybrid, TMDB/IMDb/NxSha | No caching, no backup strategy |
| **Deploy** | Vercel project linked | No CI/CD pipeline, no preview envs documented |
| **Security** | RLS policies, admin role, env validation | Secrets in `.env.local`, no rate limiting, no CSP |
| **Testing** | — | Zero tests |

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| RSC Data Fetching | `app/page.tsx:7` | `async function` with direct `await getCatalogTitles()` |
| Server Actions | `app/studio/actions.ts` | `"use server"` with `redirect()`, `revalidatePath()`, `notFound()` |
| Supabase Client | `lib/supabase/server.ts` | `createServerClient` from `@supabase/ssr` with cookie handlers |
| Error Handling (existing) | `lib/studio.ts:126` | `catch` with `// Must not break user-facing routes` comment pattern |
| CSS Variables | `app/globals.css` | Design tokens as CSS custom properties in `:root` |
| Component Pattern | `components/featured-carousel.tsx` | `"use client"` for interactive, server components for data |


## Phases

### Fase 1: Error Handling, Loading States & UX Foundation
**Goal**: Setiap route memiliki error boundary dan loading state sehingga tidak pernah menampilkan blank page.

#### Tasks
1. **Error Boundaries**
   - Create `app/error.tsx` (root) — graceful error page with retry
   - Create `error.tsx` untuk setiap route grup (movies, series, search, ranking, watch, studio)
   - Handle different error types: not found (404), server error (500), network error

2. **Loading States**
   - Create `app/loading.tsx` (root) — animated skeleton
   - Create `loading.tsx` per route — tailored skeletons (grid for catalog, detail for watch)
   - Create `app/studio/loading.tsx` — table skeleton

3. **Studio Toast/Notification System**
   - Add `?saved=1` / `?error=` banner animation with auto-dismiss
   - Add success/error colors matching design system
   - Fix current redirect messages to show inline feedback

4. **Not Found Pages**
   - Create custom `app/not-found.tsx`
   - Create `app/studio/login/not-found.tsx`

**Validate**: `npm run build` succeeds, navigate each page offline to see error boundaries

### Fase 2: Security Hardening
**Goal**: Zero secrets in codebase, CSP headers, rate limiting, input validation on all actions.

#### Tasks
1. **Secrets Management**
   - Move `.env.local` secrets to Vercel Environment Variables
   - Add `.env.local` to `.gitignore` (already there) — verify no committed secrets
   - Create `lib/env.ts` with validated environment schema (Zod)

2. **Content Security Policy**
   - Add CSP headers via `next.config.ts` or middleware
   - Allow: `image.tmdb.org`, `supabase.co`, `nxsha.app`, `archive.org`, `vitals.vercel-insights.com`
   - Add nonce-based script-src

3. **Rate Limiting**
   - Add rate limiting to auth actions (`signIn`, `signInAdmin`)
   - Add to search endpoint
   - Use Vercel KV or in-memory Map with cleanup

4. **Input Validation**
   - Add Zod schemas for all server actions (studio CRUD, login)
   - Replace manual sanitization (`text()`, `bool()`) with schema-based validation

5. **Route Protection**
   - Fix `/studio` route — verify not accessible without admin auth
   - Add middleware-based route protection for `/studio/*` paths
   - Add `/login` page with actual form (instead of `notFound()`)

**Validate**: Run `npx tsx lib/env.ts` equivalent, check CSP with curl

### Fase 3: SEO, Metadata & Social
**Goal**: Pages properly indexed, rich social previews, sitemap for crawling.

#### Tasks
1. **Dynamic Metadata**
   - Add `generateMetadata()` to all dynamic routes (`watch/[slug]`, `watch/[slug]/play`, episode page)
   - Include: title, description, OpenGraph image (poster/backdrop), Twitter card
   - Fix root metadata to use dynamic brand info

2. **Sitemap & Robots**
   - Create `app/sitemap.ts` — generate from all catalog titles
   - Create `app/robots.ts` — allow all, point to sitemap
   - Exclude `/studio` routes from index

3. **JSON-LD Structured Data**
   - Add `Movie` and `TVSeries` schema to detail pages
   - Include: name, description, image, datePublished, aggregateRating (IMDb)
   - Add `BreadcrumbList` to all pages

4. **Open Graph Images**
   - Create `app/opengraph-image.tsx` — dynamic OG image generator
   - Create per-title OG images using title poster + text overlay

**Validate**: Use `curl` or browser devtools to verify meta tags, check `/sitemap.xml`

### Fase 4: Complete Authentication & User Features
**Goal**: Full auth flow (login, register, password reset), user profiles, favorites, watch history.

#### Tasks
1. **Login Page**
   - Build proper `app/login/page.tsx` with email/password form
   - Add Google OAuth button
   - Add "Lupa password" link
   - Style consistent with dark theme
   - Add `app/register/page.tsx` for registration

2. **User Profile**
   - Create `app/profile/page.tsx` — display name, email, avatar
   - Add profile update form
   - Link to watch history and favorites

3. **Favorites (UI)**
   - Wire "Favorit" button on detail page to Supabase favorites table
   - Create `app/profile/favorites/page.tsx`
   - Add toggle (add/remove) with optimistic update

4. **Watch History**
   - Record progress from player (when JS SDK integrated)
   - Show progress bars on movie cards
   - Create "Lanjutkan Nonton" rail on homepage
   - Update `watch_history` table via Server Action

**Validate**: Login → add favorite → see it in profile → watch episode → see progress

### Fase 5: Performance Optimization
**Goal**: Fast page loads, optimal Core Web Vitals, efficient data fetching.

#### Tasks
1. **Static Generation**
   - Add `generateStaticParams()` to catalog routes (movies, series)
   - Use `force-static` or `revalidate` for mostly-static pages
   - Configure ISR with `revalidate` in `fetchSupabaseTitles`

2. **Image Optimization**
   - Verify all images use Next `<Image>` with proper sizes
   - Add `priority` to hero images and above-fold content
   - Configure TMDB image widths correctly in `remotePatterns`

3. **Data Caching**
   - Add `React.cache()` to catalog data functions
   - Add client-side SWR/React Query for interactive data
   - Cache filter options (genres, countries, etc.)

4. **Bundle Optimization**
   - Audit imports — replace `lucide-react` with tree-shakeable imports
   - Dynamic import heavy components (player iframe, studio forms)
   - Remove unused CSS from `globals.css`

5. **Font Loading**
   - Add `@next/font` for Inter and Space Grotesk
   - Preload critical font
   - Add `font-display: swap` fallback (verify in CSS)

**Validate**: Lighthouse scores, `npm run build` output, bundle analyzer

### Fase 6: Testing
**Goal**: 80%+ coverage on critical paths.

#### Tasks
1. **Test Infrastructure**
   - Set up Vitest + React Testing Library
   - Set up Playwright for E2E
   - Create test configuration matching tsconfig paths

2. **Unit Tests (~60% target)**
   - `lib/images.ts` — posterImage, cssImage, tmdbImage edge cases
   - `lib/nxsha.ts` — buildNxshaEmbedUrl with various params
   - `lib/data.ts` — getFilteredTitles, dedupeTitleSeeds
   - `lib/studio.ts` — recordAuditEvent (mock supabase)

3. **Integration Tests (~15% target)**
   - `lib/catalog.ts` — getCatalogTitles with mock Supabase
   - `app/studio/actions.ts` — saveTitle with mock client (basic)

4. **E2E Tests (~5% target)**
   - Homepage renders with rails
   - Search page filters work
   - Watch detail page shows content
   - Studio login → CRUD flow (Playwright)

**Validate**: `npx vitest run`, `npx playwright test --reporter=list`

### Fase 7: Monitoring, CI/CD & Infrastructure
**Goal**: Automated deploys, error tracking, performance monitoring, backup strategy.

#### Tasks
1. **CI/CD Pipeline**
   - Create `.github/workflows/ci.yml` — lint, type-check, test on PR
   - Create `.github/workflows/deploy.yml` — auto-deploy to Vercel on main
   - Add branch protection rules

2. **Error Tracking**
   - Install and configure Sentry for Next.js
   - Capture server/client errors with source maps
   - Add `Sentry.onError()` wrapper on client

3. **Database Operations**
   - Create `scripts/migrate.ts` — idempotent migration runner
   - Create `scripts/backup.ts` — Supabase pg_dump wrapper
   - Document SOP for schema changes in README

4. **Environment Documentation**
   - Update `.env.example` with all required vars and descriptions
   - Document which vars are public vs private
   - Add Vercel environment setup guide

**Validate**: PR triggers CI, deploy succeeds, Sentry captures test error

## Files to Change

| File | Action | Why |
|---|---|---|
| `app/error.tsx` | CREATE | Root error boundary |
| `app/loading.tsx` | CREATE | Root loading skeleton |
| `app/not-found.tsx` | CREATE | Custom 404 |
| `app/sitemap.ts` | CREATE | Dynamic sitemap for SEO |
| `app/robots.ts` | CREATE | Robots configuration |
| `app/opengraph-image.tsx` | CREATE | Dynamic OG image |
| `app/movies/error.tsx` | CREATE | Movies page error |
| `app/movies/loading.tsx` | CREATE | Movies grid skeleton |
| `app/series/error.tsx` | CREATE | Series page error |
| `app/series/loading.tsx` | CREATE | Series grid skeleton |
| `app/search/error.tsx` | CREATE | Search error boundary |
| `app/search/loading.tsx` | CREATE | Search skeleton |
| `app/ranking/error.tsx` | CREATE | Ranking error |
| `app/ranking/loading.tsx` | CREATE | Ranking skeleton |
| `app/watch/[slug]/error.tsx` | CREATE | Watch detail error |
| `app/watch/[slug]/loading.tsx` | CREATE | Watch detail skeleton |
| `app/watch/[slug]/play/error.tsx` | CREATE | Player error |
| `app/studio/error.tsx` | CREATE | Studio error |
| `app/studio/loading.tsx` | CREATE | Studio loading |
| `app/login/page.tsx` | UPDATE | Build real login form (replace notFound) |
| `app/login/actions.ts` | UPDATE | Add Zod validation, rate limiting |
| `app/register/page.tsx` | CREATE | User registration page |
| `app/admin/page.tsx` | UPDATE | Either build or document as placeholder |
| `app/profile/page.tsx` | CREATE | User profile page |
| `app/profile/favorites/page.tsx` | CREATE | Favorites list page |
| `app/page.tsx` | UPDATE | Add "Lanjutkan Nonton" rail, loading |
| `app/watch/[slug]/page.tsx` | UPDATE | Wire favorites, generateMetadata, JSON-LD |
| `app/watch/[slug]/play/page.tsx` | UPDATE | generateMetadata, JSON-LD |
| `app/watch/[slug]/season/[seasonNumber]/episode/[episodeNumber]/page.tsx` | UPDATE | generateMetadata, JSON-LD |
| `app/studio/actions.ts` | UPDATE | Zod validation, improve error feedback |
| `app/studio/page.tsx` | UPDATE | Toast/notification feedback UI |
| `lib/env.ts` | CREATE | Zod schema for all env vars |
| `lib/rate-limit.ts` | CREATE | Rate limiting utility |
| `lib/supabase/server.ts` | — | Already solid, minor caching |
| `lib/catalog.ts` | UPDATE | Add React.cache(), improve error handling |
| `lib/studio.ts` | UPDATE | Add input sanitization via Zod |
| `components/site-shell.tsx` | UPDATE | Add user menu, profile link |
| `components/movie-card.tsx` | UPDATE | Memoize, loading placeholder |
| `components/featured-carousel.tsx` | UPDATE | Memoize, accessibility audit |
| `components/poster-image.tsx` | UPDATE | Better error fallback |
| `next.config.ts` | UPDATE | Add CSP headers, image optimization |
| `middleware.ts` | UPDATE | Route protection for /studio/* |
| `next.config.ts` | UPDATE | Add headers for security |
| `.env.example` | UPDATE | Comprehensive env documentation |
| `package.json` | UPDATE | Add test, lint scripts |
| `vitest.config.ts` | CREATE | Test configuration |
| `tsconfig.json` | — | Already has `@/*` path alias |
| `.github/workflows/ci.yml` | CREATE | CI pipeline |
| `.github/workflows/deploy.yml` | CREATE | Deploy pipeline |

## Tasks Detail

### Task 1: Error Boundaries & Loading States
- **Action**: Create `error.tsx` and `loading.tsx` at root and all route segments
- **Mirror**: Existing error comment pattern `// Must not break user-facing routes`
- **Validate**: `npm run build && npm start` — navigate to each page

### Task 2: Security Hardening
- **Action**: Move secrets, add CSP, Zod validation for all env vars and server actions
- **Mirror**: `lib/supabase/env.ts` pattern for env validation
- **Validate**: `npm run build` — no secrets in bundle

### Task 3: SEO & Metadata
- **Action**: generateMetadata for all routes, sitemap, robots, JSON-LD
- **Mirror**: RSC data pattern (async, `await` directly)
- **Validate**: `curl http://localhost:3000/sitemap.xml` returns valid XML

### Task 4: Auth & User Features
- **Action**: Login page, registration, profile, favorites, watch history
- **Mirror**: Existing `signIn`/`signOut` pattern in `app/login/actions.ts`
- **Validate**: Manual auth flow end-to-end

### Task 5: Performance Optimization
- **Action**: ISR, caching, image opt, bundle split, font loading
- **Mirror**: `next.config.ts` patterns
- **Validate**: Lighthouse score improvement

### Task 6: Testing
- **Action**: Vitest setup, unit tests for utilities, Playwright for E2E
- **Mirror**: AAA pattern from `rules/ecc/common/testing.md`
- **Validate**: `npx vitest run --coverage` shows >80%

### Task 7: CI/CD & Monitoring
- **Action**: GitHub Actions, Sentry, migration runner, backup script
- **Validate**: PR triggers CI, deploy preview works

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `.env.local` secrets already committed to git | Medium | Add to `.gitignore` (verified), rotate keys, use Vercel env |
| Supabase RLS policy bypass via nested joins | Low | Audit `catalog.ts` supabase queries — use `select()` not RPC |
| NxSha embed provider may change API | Medium | Abstract to `lib/nxsha.ts`, add error fallback in player |
| TMDB image URLs may become stale | Medium | `PosterImage` already has fallback — add refresh script cron |
| Large globals.css (1000+ lines) | Low | Extract component CSS to modules |
| No backup strategy for Supabase DB | High | Add script and document pg_dump in Phase 7 |
| Login page currently 404 (stub) | Medium | Build actual login page in Phase 4 |

## Acceptance

- [ ] All pages have error boundaries and loading states
- [ ] `.env.local` secrets moved to Vercel, CSP configured
- [ ] Sitemap, robots, JSON-LD, OG images for all pages
- [ ] Full auth flow: login, register, profile, favorites, watch history
- [ ] Lighthouse scores ≥ 90 for all categories
- [ ] Test coverage ≥ 80% on utilities, ≥ 60% overall
- [ ] CI/CD pipeline with automated deploy
- [ ] Sentry error tracking active
- [ ] Database backup & migration strategy documented
