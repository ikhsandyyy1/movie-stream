# Movie Stream — Production Ready Enhanced Design

## Vision
Website streaming movie/series dengan pengalaman sinematik yang imersif: 3D interactive, motion halus, performa tinggi, aman, dan siap produksi.

## Dua Pilar Desain
1. **Foundation** — Error handling, security, SEO, auth, perf, testing, CI/CD (7 fase original)
2. **Visual Experience** — 3D tilt cards, parallax depth hero, 3D gallery, page transitions, scroll reveal, micro-interactions

---

## SECTION A: Komponen 21st.dev yang Akan Digunakan

### A.1 3D Interactive Components
| Komponen | Sumber | Fungsi |
|---|---|---|
| `ParallaxTiltCard` | 21st.dev | Poster film dengan 3D tilt + depth layer (17.5deg max) |
| `AnimatedPromoCard` | 21st.dev | Hero promo card dengan 3D tilt + CTA |
| `InteractiveCard` | 21st.dev | Wrapper generik untuk 3D hover pada card manapun |
| `LayeredParallaxHero` | 21st.dev | 3-layer depth hero (background, mid, foreground) + mouse tracking |
| `Floating` / `FloatingElement` | 21st.dev | Parallax floating images di hero section |
| `Ethereal` (Three.js) | 21st.dev | 3D real-time mesh sebagai background hero interaktif |

### A.2 Motion Components
| Komponen | Sumber | Fungsi |
|---|---|---|
| `ContainerScroll` / `ContainerAnimated` | 21st.dev | Scroll-triggered reveal animations (top/bottom/blur/z/left/right) |
| `ContainerStagger` | 21st.dev | Stagger children animation dalam satu container |
| `ContainerInset` | 21st.dev | Clip-path reveal efek (seperti video yang terungkap saat scroll) |
| `TimelineContent` | 21st.dev | Timeline scroll-reveal dengan blur + y transisi |
| `TextRotate` | 21st.dev | Animated text rotation (untuk hero subtitle) |
| `BentoGrid` / `BentoGridItem` | 21st.dev | Bento layout untuk halaman eksplorasi |

### A.3 UI Components (existing project)
| Komponen | Status | Action |
|---|---|---|
| `site-shell.tsx` | Existing | + user menu dropdown |
| `movie-card.tsx` | Existing | Upgrade ke 3D tilt |
| `featured-carousel.tsx` | Existing | + parallax depth layers |
| `filter-bar.tsx` | Existing | + micro-interactions |
| `poster-image.tsx` | Existing | + loading skeleton animasi |
| `title-rail.tsx` | Existing | + scroll reveal stagger |

---

## SECTION B: /goal Goals Breakdown

### GOAL 0: Setup & Infrastructure
- [ ] 0.1 Initialize shadcn/ui, framer-motion, three.js dependencies
- [ ] 0.2 Setup `lib/utils.ts` (cn utility), `lib/animations.ts` (shared variants)
- [ ] 0.3 Setup `components/ui/` folder structure untuk 21st.dev components
- [ ] 0.4 Configure `next.config.ts` untuk Three.js transpile
- [ ] 0.5 Document ECC hooks: PostToolUse untuk format + lint + typecheck

### GOAL 1: Error Boundaries & Loading (Foundation)
- [ ] 1.1 `app/error.tsx` — root error boundary with retry + brand style
- [ ] 1.2 `app/loading.tsx` — root skeleton dengan pulse animation
- [ ] 1.3 Error & loading per route: movies, series, search, ranking, watch
- [ ] 1.4 `app/not-found.tsx` — custom 404 dengan pencarian
- [ ] 1.5 Studio toast/notification system

### GOAL 2: 3D Poster Cards (Visual)
- [ ] 2.1 Install & adapt `InteractiveCard` — generic 3D tilt wrapper component
- [ ] 2.2 Create `MovieCard3D.tsx` — extended MovieCard dengan 3D tilt + glow effect
- [ ] 2.3 Integrate ke `title-rail.tsx` — setiap card di rail punya 3D hover
- [ ] 2.4 Apply ke halaman movies & series grid
- [ ] 2.5 Poster depth layers: backdrop → poster → badge → title dalam 3D space

### GOAL 3: 3D Hero & Featured Section (Visual)
- [ ] 3.1 Adapt `LayeredParallaxHero` — hero dengan 3 depth layers (background, particles/glow, content)
- [ ] 3.2 Integrasi ke `FeaturedCarousel` — setiap slide punya parallax depth sendiri
- [ ] 3.3 Poster strip (featured thumbnails) jadi 3D tilt thumbnails
- [ ] 3.4 Floating backdrop elements dengan parallax mouse tracking
- [ ] 3.5 "Play" button dengan magnetic hover + glow effect

### GOAL 4: Page Transitions & Navigation (Visual)
- [ ] 4.1 Install framer-motion `AnimatePresence` untuk page transitions
- [ ] 4.2 Create `PageTransition` wrapper — fade + slide + scale transisi antar halaman
- [ ] 4.3 Apply ke `layout.tsx` — wrap `{children}` dengan AnimatePresence
- [ ] 4.4 Nav links active state dengan animated indicator
- [ ] 4.5 Bottom nav mobile dengan spring animations

### GOAL 5: Scroll-Reveal & Stagger (Visual)
- [ ] 5.1 Adapt `ContainerScroll` / `ContainerAnimated` untuk section reveals
- [ ] 5.2 Homepage rails: setiap rail muncul dengan stagger animation saat scroll
- [ ] 5.3 Episode grid di detail page: reveal bertahap
- [ ] 5.4 Ranking sections: fade-in saat scroll
- [ ] 5.5 Studio dashboard: metric cards count-up animation

### GOAL 6: Micro-Interactions (Visual)
- [ ] 6.1 Buttons: hover scale + glow + spring feedback
- [ ] 6.2 Nav links: underline/border animated glow
- [ ] 6.3 Loading skeletons: pulse with gradient shimmer
- [ ] 6.4 Search field: focus ring + expanded animation
- [ ] 6.5 Genre pills: hover scale + color shift
- [ ] 6.6 Like/favorite button: heart animation (scale + color)
- [ ] 6.7 IMDb rating badge: subtle glow

### GOAL 7: Bento Grid Gallery (Visual)
- [ ] 7.1 Create `BentoGallery` — bento layout dengan staggered reveal
- [ ] 7.2 Featured movies/series dalam bento grid di halaman explore
- [ ] 7.3 Each bento item punya 3D tilt hover
- [ ] 7.4 Category sections dengan bento layout

### GOAL 8: Security Hardening (Foundation)
- [ ] 8.1 Move secrets to Vercel env, validate dengan Zod (`lib/env.ts`)
- [ ] 8.2 CSP headers via next.config.ts
- [ ] 8.3 Rate limiting auth actions
- [ ] 8.4 Zod validation untuk semua server actions
- [ ] 8.5 Route protection `/studio/*` via middleware

### GOAL 9: SEO & Metadata (Foundation)
- [ ] 9.1 `generateMetadata()` semua dynamic pages
- [ ] 9.2 `app/sitemap.ts` + `app/robots.ts`
- [ ] 9.3 JSON-LD (Movie, TVSeries, BreadcrumbList)
- [ ] 9.4 Dynamic OG image generator
- [ ] 9.5 Structured data untuk setiap title

### GOAL 10: Auth & User Features (Foundation)
- [ ] 10.1 Login page with email/password + Google OAuth
- [ ] 10.2 Registration page
- [ ] 10.3 User profile page
- [ ] 10.4 Favorites: toggle + page
- [ ] 10.5 Watch history recording + "Lanjutkan Nonton" rail

### GOAL 11: Performance (Foundation)
- [ ] 11.1 `generateStaticParams()` untuk catalog routes
- [ ] 11.2 ISR + `React.cache()` untuk data fetching
- [ ] 11.3 Image optimization (Next/Image sizes, priority)
- [ ] 11.4 Bundle optimization (tree-shake lucide, dynamic imports)
- [ ] 11.5 Font loading (Inter + Space Grotesk via `@next/font`)

### GOAL 12: Testing (Foundation)
- [ ] 12.1 Vitest + RTL setup
- [ ] 12.2 Unit tests: images.ts, nxsha.ts, data.ts
- [ ] 12.3 Integration: studio.ts, catalog.ts
- [ ] 12.4 Playwright E2E: homepage, search, watch detail
- [ ] 12.5 Accessibility audit + reduced-motion verification

### GOAL 13: CI/CD & Monitoring (Foundation)
- [ ] 13.1 GitHub Actions CI (lint, typecheck, test)
- [ ] 13.2 Auto-deploy Vercel
- [ ] 13.3 Sentry error tracking
- [ ] 13.4 Database migration runner + backup script
- [ ] 13.5 Environment documentation

---

## SECTION C: Arsitektur Komponen 3D

```
components/
├── ui/                          # 21st.dev adapted components
│   ├── interactive-card.tsx      # Generic 3D tilt wrapper
│   ├── parallax-card.tsx         # 3D card with image + content depth
│   ├── promo-card.tsx            # Hero promo card 3D
│   ├── layer-parallax-hero.tsx   # 3-layer depth hero
│   ├── parallax-floating.tsx     # Floating elements with parallax
│   ├── container-scroll.tsx      # Scroll-triggered reveal system
│   ├── animated-container.tsx    # Individual animated container
│   ├── text-rotate.tsx           # Animated text rotation
│   ├── bento-grid.tsx            # Bento grid layout
│   └── page-transition.tsx       # Page transition wrapper
├── movie-card-3d.tsx            # Movie card with 3D tilt + glow
├── featured-carousel-3d.tsx     # Hero dengan depth layers + 3D
├── animated-rail.tsx            # Title rail + scroll stagger
└── gallery-bento.tsx            # Bento gallery page
```

### Data Flow 3D
```
User mouse → InteractiveCard (motion values) → 
  ├── rotateX/Y transform → visual tilt
  ├── translateZ → depth layers
  ├── glow intensity
  └── reset on mouse leave (spring animation)
```

### Scroll-Reveal Orchestration
```
Intersection Observer (useInView) → 
  ContainerStagger (parent delay) →
    ContainerAnimated (child variants) →
      opacity: 0→1, y: 20→0, filter: blur→0
```

---

## SECTION D: ECC & Superpowers Utilization

### Skills yang Akan Digunakan
| Skill | Goal | Kegunaan |
|---|---|---|
| `frontend-design` | 2-7 | Guide implementasi visual 3D & motion |
| `test-driven-development` | 12 | TDD untuk utility functions |
| `systematic-debugging` | All | Debug jika ada issue |
| `code-review` | All | Review code setelah implementasi |
| `verification-before-completion` | All | Verifikasi tiap goal selesai |
| `design-taste-frontend` | 2-7 | Taste check visual quality |
| `accessibility` | 6, 12 | Aksesibilitas + reduced-motion |
| `writing-plans` | Post-design | Generate task list |
| `security-review` | 8 | Security audit |
| `vercel:ai-sdk` | — | (jika perlu AI features) |
| `supabase:supabase` | 10 | Auth & database |

### Agents yang Akan Digunakan
| Agent | Goal | Kegunaan |
|---|---|---|
| `planner` | All | Planning detail per goal |
| `code-reviewer` | All | Review setiap goal |
| `tdd-guide` | 12 | TDD workflow |
| `security-reviewer` | 8 | Security audit |
| `react-reviewer` | 2-7 | React patterns |
| `react-build-resolver` | All | Fix build errors |
| `e2e-runner` | 12.4 | Playwright E2E tests |
| `refactor-cleaner` | All | Cleanup after each goal |

### Hooks yang Akan Dikonfigurasi
```json
{
  "PostToolUse": [
    "Prettier format on Write/Edit",
    "TypeScript check (tsc --noEmit --incremental)",
    "ESLint fix on Write/Edit"
  ]
}
```

---

## SECTION E: Daftar Dependency Baru

```json
{
  "dependencies": {
    "framer-motion": "^11.x || motion",
    "three": "^0.170.x",
    "@types/three": "^0.170.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@playwright/test": "^1.x",
    "@sentry/nextjs": "^8.x"
  }
}
```

## SECTION F: Response Mode Check

### For users with reduced-motion preference:
- All 3D tilt effects skip (no transform)
- Scroll reveals reduce to simple opacity fades
- Page transitions skip to instant render
- Hero parallax skips to static
- Auto-playing carousel pause

### Responsive:
- Mobile: Reduced 3D intensity, simplified hero, single-column bento
- Tablet: Medium 3D, 2-column bento
- Desktop: Full 3D experience

---

## Arsitektur File

```
app/
├── error.tsx          → new
├── loading.tsx        → new
├── not-found.tsx      → new
├── sitemap.ts         → new
├── robots.ts          → new
├── opengraph-image.tsx → new
├── layout.tsx         → + PageTransition wrapper
├── page.tsx           → + 3D rails + scroll reveal
├── login/page.tsx     → rebuild (remove notFound)
├── register/page.tsx  → new
├── profile/
│   ├── page.tsx       → new
│   └── favorites/page.tsx → new
├── movies/page.tsx    → + error/loading, 3D cards
├── series/page.tsx    → + error/loading, 3D cards
├── search/page.tsx    → + error/loading, micro-interactions
├── ranking/page.tsx   → + error/loading, scroll reveal
├── studio/
│   ├── error.tsx      → new
│   ├── loading.tsx    → new
│   └── page.tsx       → + count-up metrics, toast
└── watch/[slug]/
    ├── page.tsx       → + JSON-LD, generateMetadata, favorites wire
    ├── error.tsx      → new
    ├── loading.tsx    → new
    ├── play/page.tsx  → + generateMetadata
    └── season/[n]/episode/[n]/page.tsx → + navigation animation

components/
├── ui/               → 21st.dev adapted (10 components)
├── movie-card-3d.tsx → new
├── animated-rail.tsx → new
└── gallery-bento.tsx → new

lib/
├── env.ts            → new (Zod env validation)
├── rate-limit.ts     → new
├── animations.ts     → new (shared Framer Motion variants)
└── utils.ts          → new (cn utility)
```
