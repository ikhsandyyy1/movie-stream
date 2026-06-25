# Movie Stream — Production Ready Enhanced Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transform the movie streaming MVP into a production-ready app with 3D interactive UI, smooth motion, complete security, SEO, auth, performance, testing, and CI/CD.

**Architecture:** Next.js 15 App Router dengan hybrid data (mock local + Supabase), 3D/motion via Framer Motion + Three.js adaptation dari 21st.dev components, auth via Supabase Auth, deployment via Vercel.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.6, Supabase (Postgres + Auth + Storage), Framer Motion, Three.js, shadcn/ui utility pattern, Vitest, Playwright, Sentry, GitHub Actions.

## Global Constraints

- Target ES2017, strict TypeScript enabled, `@/*` path alias
- All 3D interactions must respect `prefers-reduced-motion: reduce` (skip transforms)
- Use framer-motion or motion library; prefer `motion/react` if using motion v11+
- All new components follow existing dark cinematic design system (CSS variables in `:root`)
- Server components default; `"use client"` only for interactive/3D components
- All server actions must have Zod validation
- All env vars validated via `lib/env.ts`
- Secrets never in source code — use Vercel environment variables
- Minimum 80% test coverage on utility functions

---

### Task 0: Project Setup, Dependencies & Infrastructure

**Files:**
- Modify: `package.json` — add dependencies
- Create: `lib/utils.ts` — cn utility
- Create: `lib/animations.ts` — shared Framer Motion variants
- Create: `components/ui/index.ts` — barrel export
- Modify: `next.config.ts` — transpilePackages for three

- [ ] **Step 0.1: Install dependencies**

Run:
```bash
cd /home/can/Document/movie-stream
npm install framer-motion three@0.170.0 class-variance-authority clsx tailwind-merge
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
npm install -D @sentry/nextjs @types/three
```

Expected: All packages installed, `package-lock.json` updated.

- [ ] **Step 0.2: Create lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 0.3: Create lib/animations.ts**

```typescript
import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};
```

- [ ] **Step 0.4: Update next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "qcbtbbajmvailfolkqoq.supabase.co" },
    ]
  },
  // For Three.js (Ethereal component)
  transpilePackages: ["three"]
};

export default nextConfig;
```

- [ ] **Step 0.5: Create components/ui/index.ts**

```typescript
export { cn } from "@/lib/utils";
```

- [ ] **Step 0.6: Commit**

```bash
git add package.json package-lock.json lib/utils.ts lib/animations.ts components/ui/index.ts next.config.ts
git commit -m "chore: setup project dependencies and utility functions"
```

---

### Task 1: Error Boundaries & Loading States

**Files:**
- Create: `app/error.tsx`
- Create: `app/loading.tsx`
- Create: `app/not-found.tsx`
- Create: `app/movies/error.tsx`
- Create: `app/movies/loading.tsx`
- Create: `app/series/error.tsx`
- Create: `app/series/loading.tsx`
- Create: `app/search/error.tsx`
- Create: `app/search/loading.tsx`
- Create: `app/ranking/error.tsx`
- Create: `app/ranking/loading.tsx`
- Create: `app/watch/[slug]/error.tsx`
- Create: `app/watch/[slug]/loading.tsx`
- Create: `app/watch/[slug]/play/error.tsx`
- Create: `app/studio/error.tsx`
- Create: `app/studio/loading.tsx`

- [ ] **Step 1.1: Create app/error.tsx** (root error boundary)

```typescript
"use client";

import { useEffect } from "react";
import { Clapperboard } from "lucide-react";

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="brand-mark" style={{ width: 64, height: 64, margin: "0 auto", fontSize: 28 }}>
          <Clapperboard size={32} />
        </span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Terjadi Kesalahan</h1>
      <p className="lead" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
        Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah mendapat notifikasi.
      </p>
      <button className="button" onClick={reset} type="button">
        Coba Lagi
      </button>
    </div>
  );
}
```

- [ ] **Step 1.2: Create app/loading.tsx** (root loading skeleton)

```typescript
export default function RootLoading() {
  return (
    <div className="page" style={{ paddingBlock: "80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="skeleton" style={{ width: "40%", height: 32, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "70%", height: 18, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 18 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton poster-skeleton" />
              <div className="skeleton" style={{ width: "80%", height: 16, marginTop: 10 }} />
              <div className="skeleton" style={{ width: "50%", height: 12, marginTop: 6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 1.3: Add skeleton CSS to app/globals.css**

Add to `app/globals.css` (before the media queries):

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface-2) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius);
}

.poster-skeleton {
  aspect-ratio: 2 / 3;
  width: 100%;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 1.4: Create app/not-found.tsx**

```typescript
import Link from "next/link";
import { Clapperboard, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="brand-mark" style={{ width: 64, height: 64, margin: "0 auto", fontSize: 28 }}>
          <Clapperboard size={32} />
        </span>
      </div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>404 — Halaman Tidak Ditemukan</h1>
      <p className="lead" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link className="button" href="/">Kembali ke Beranda</Link>
        <Link className="button secondary" href="/search">
          <Search size={18} />
          Cari Konten
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 1.5: Create error.tsx for each route group**

Pattern yang sama untuk semua route:

**`app/movies/error.tsx`**:
```typescript
"use client";
export default function MoviesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page" style={{ textAlign: "center", paddingBlock: "80px" }}>
      <h1 className="page-title">Gagal Memuat Film</h1>
      <p className="lead">Terjadi kesalahan saat memuat katalog film.</p>
      <button className="button" onClick={reset} type="button">Coba Lagi</button>
    </div>
  );
}
```

Buat file yang sama untuk: `series`, `search`, `ranking`, `watch/[slug]`, `watch/[slug]/play`, `studio`. Gunakan judul yang sesuai per route.

- [ ] **Step 1.6: Create loading.tsx for each route group**

**`app/movies/loading.tsx`**:
```typescript
export default function MoviesLoading() {
  return (
    <div className="page">
      <div className="skeleton" style={{ width: "15%", height: 16, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "30%", height: 40, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: "50%", height: 18, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 18 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton poster-skeleton" />
            <div className="skeleton" style={{ width: "80%", height: 16, marginTop: 10 }} />
            <div className="skeleton" style={{ width: "50%", height: 12, marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

Duplikasi pattern untuk: `series`, `search`, `ranking`, `watch/[slug]`, `studio`.

- [ ] **Step 1.7: Commit**

```bash
git add app/error.tsx app/loading.tsx app/not-found.tsx app/globals.css
git add app/movies/error.tsx app/movies/loading.tsx app/series/error.tsx app/series/loading.tsx
git add app/search/error.tsx app/search/loading.tsx app/ranking/error.tsx app/ranking/loading.tsx
git add app/watch/\[slug\]/error.tsx app/watch/\[slug\]/loading.tsx app/watch/\[slug\]/play/error.tsx
git add app/studio/error.tsx app/studio/loading.tsx
git commit -m "feat: add error boundaries and loading skeletons for all routes"
```

---

### Task 2: 3D Poster Cards

**Files:**
- Create: `components/ui/interactive-card.tsx`
- Create: `components/movie-card-3d.tsx`
- Modify: `components/title-rail.tsx`
- Modify: `app/movies/page.tsx`
- Modify: `app/series/page.tsx`

- [ ] **Step 2.1: Create InteractiveCard (generic 3D tilt wrapper)**

```typescript
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  glowColor?: string;
}

export function InteractiveCard({
  children,
  className,
  tiltDegree = 7.5,
  glowColor
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30, bounce: 0 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30, bounce: 0 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${tiltDegree}deg`, `-${tiltDegree}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${tiltDegree}deg`, `${tiltDegree}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative", className)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
      {/* Glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: glowColor
            ? `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`
            : undefined,
        }}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2.2: Create MovieCard3D**

```typescript
import Link from "next/link";
import { Play } from "lucide-react";
import { PosterImage } from "@/components/poster-image";
import { InteractiveCard } from "@/components/ui/interactive-card";
import type { Title } from "@/lib/data";

export function MovieCard3D({ title }: { title: Title }) {
  return (
    <InteractiveCard tiltDegree={8} className="group movie-card">
      <Link href={`/watch/${title.slug}`} aria-label={`Buka ${title.title}`}>
        <PosterImage
          src={title.poster}
          alt={title.title}
          badge={title.type === "movie" ? "Film" : "Series"}
        />
        <div className="card-title">{title.title}</div>
        <div className="card-meta">
          {title.imdbRank ? `#${title.imdbRank} · ` : ""}
          {title.imdbRating ? `IMDb ${title.imdbRating.toFixed(1)} · ` : ""}
          {title.year} · {title.genres[0]}
        </div>
        {title.progress ? (
          <div aria-label={`Progress tontonan ${title.progress}%`} style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: "rgba(255,255,255,.12)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${title.progress}%`, height: "100%", background: "var(--primary)" }} />
            </div>
          </div>
        ) : null}
      </Link>
    </InteractiveCard>
  );
}
```

- [ ] **Step 2.3: Update TitleRail to use MovieCard3D**

Modify `components/title-rail.tsx`:
- Change import: `import { MovieCard } from "@/components/movie-card"` → `import { MovieCard3D } from "@/components/movie-card-3d"`
- Change render: `<MovieCard key={item.id} title={item} />` → `<MovieCard3D key={item.id} title={item} />`

- [ ] **Step 2.4: Update Movies and Series pages**

Modify `app/movies/page.tsx` dan `app/series/page.tsx`:
- Change import: `MovieCard` → `MovieCard3D`
- Change render: `<MovieCard` → `<MovieCard3D`

- [ ] **Step 2.5: Commit**

```bash
git add components/ui/interactive-card.tsx components/movie-card-3d.tsx
git add components/title-rail.tsx app/movies/page.tsx app/series/page.tsx
git commit -m "feat: add 3D interactive poster cards with tilt effect"
```

---

### Task 3: 3D Hero & Featured Section

**Files:**
- Create: `components/ui/layer-parallax-hero.tsx`
- Create: `components/ui/parallax-floating.tsx`
- Modify: `components/featured-carousel.tsx`

- [ ] **Step 3.1: Create LayerParallaxHero**

```typescript
"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LayerParallaxHeroProps {
  children: React.ReactNode;
  className?: string;
  layers?: {
    depth: number;
    children: React.ReactNode;
  }[];
}

export function LayerParallaxHero({ children, className, layers = [] }: LayerParallaxHeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x, y });
  };

  // Reduced motion check
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-hidden", className)}
      style={{ perspective: "1000px" }}
    >
      {layers.map((layer, i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-0"
          style={{
            transform: prefersReduced
              ? "none"
              : `translateX(${mousePos.x * -layer.depth}px) translateY(${mousePos.y * -layer.depth}px) translateZ(${-layer.depth * 50}px)`,
            transition: "transform 0.2s ease-out",
            zIndex: -layers.length + i,
          }}
        >
          {layer.children}
        </div>
      ))}
      <div
        className="relative z-10"
        style={{
          transform: prefersReduced ? "none" : `translateZ(50px)`,
        }}
      >
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 3.2: Update FeaturedCarousel with depth layers**

Modify `components/featured-carousel.tsx`:

Add imports at top:
```typescript
import { LayerParallaxHero } from "@/components/ui/layer-parallax-hero";
```

Wrap the hero section with depth layers. Replace the `<section className="hero featured-carousel" ...>` with:

```typescript
<LayerParallaxHero
  className="hero featured-carousel"
  layers={[
    {
      depth: 30,
      children: (
        <div
          style={{
            ...(current.backdrop ? { backgroundImage: current.backdrop, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(4px)", opacity: 0.6, transform: "scale(1.1)" } : {}),
            position: "absolute", inset: 0,
          }}
        />
      ),
    },
    {
      depth: 15,
      children: (
        <div
          style={{
            ...(current.backdrop ? { backgroundImage: current.backdrop, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            position: "absolute", inset: 0,
          }}
        />
      ),
    },
  ]}
>
  {/* existing hero-content, featured-poster-strip, featured-controls */}
</LayerParallaxHero>
```

- [ ] **Step 3.3: Add mouse parallax to poster strip thumbnails**

Add to each featured-thumb button:
```typescript
style={{
  transform: `translateY(${index === active ? -8 : 0}px) perspective(600px) rotateY(${(index - active) * 5}deg)`,
  transition: "all 0.3s ease",
}}
```

- [ ] **Step 3.4: Add magnetic hover + glow to Play button**

Find the play button link and wrap or add:
```typescript
// Add hover glow effect to the play CTA
className="button relative overflow-hidden group"
```
Add inline style untuk glow effect:
```css
/* Add to the button style */
box-shadow: "var(--glow-primary)",
transition: "transform 0.2s ease, box-shadow 0.3s ease"
```
And a hover handler:
```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.05)";
  e.currentTarget.style.boxShadow = "0 0 40px rgba(229, 9, 20, 0.6)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.boxShadow = "var(--glow-primary)";
}}
```

- [ ] **Step 3.5: Commit**

```bash
git add components/ui/layer-parallax-hero.tsx components/featured-carousel.tsx
git commit -m "feat: add 3D parallax depth layers to featured hero section"
```

---

### Task 4: Page Transitions

**Files:**
- Create: `components/ui/page-transition.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 4.1: Create PageTransition component**

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4.2: Wrap children in layout.tsx**

Modify `app/layout.tsx` — add import and wrap:

```typescript
import { PageTransition } from "@/components/ui/page-transition";
```

Wrap children:
```typescript
<SiteShell>
  <PageTransition>{children}</PageTransition>
</SiteShell>
```

- [ ] **Step 4.3: Add active nav indicator animation**

Modify `components/site-shell.tsx` — add active state detection using `usePathname()`:

Add `"use client"` at top (or extract nav as client component). Then:
```typescript
import { usePathname } from "next/navigation";

// Inside component:
const pathname = usePathname();

// For nav links, add active class:
className={`nav-link${pathname === item.href ? " active" : ""}`}
```

Add CSS for active nav:
```css
.nav-link.active {
  color: var(--text);
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.16), rgba(255, 138, 0, 0.09));
  box-shadow: inset 0 -2px 0 var(--primary-strong);
}
```

- [ ] **Step 4.4: Commit**

```bash
git add components/ui/page-transition.tsx app/layout.tsx
git commit -m "feat: add page transitions with AnimatePresence"
```

---

### Task 5: Scroll-Reveal & Stagger Animations

**Files:**
- Create: `components/ui/container-scroll.tsx`
- Create: `components/animated-rail.tsx`
- Modify: `app/page.tsx`
- Modify: `app/ranking/page.tsx`
- Modify: `app/watch/[slug]/page.tsx`

- [ ] **Step 5.1: Create ContainerScroll / ContainerAnimated components**

```typescript
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type AnimationType = "top" | "bottom" | "left" | "right" | "blur" | "z" | "fade";

const getVariants = (animate: AnimationType) => ({
  hidden: {
    x: animate === "left" ? "-30px" : animate === "right" ? "30px" : 0,
    y: animate === "top" ? "-20px" : animate === "bottom" ? "20px" : 0,
    scale: animate === "z" ? 0.9 : 1,
    filter: animate === "blur" ? "blur(8px)" : "blur(0px)",
    opacity: 0,
  },
  visible: {
    x: 0, y: 0, scale: 1, filter: "blur(0px)", opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, mass: 0.8 },
  },
});

export function ContainerStagger({
  children, className, once = true, ...props
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ContainerAnimated({
  children, className, animation = "fade", ...props
}: {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
}) {
  const variants = getVariants(animation);

  return (
    <motion.div variants={variants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5.2: Create AnimatedRail wrapper**

```typescript
import Link from "next/link";
import { ContainerStagger, ContainerAnimated } from "@/components/ui/container-scroll";
import type { Title } from "@/lib/data";
import { MovieCard3D } from "@/components/movie-card-3d";

export function AnimatedRail({
  title,
  href,
  items
}: {
  title: string;
  href?: string;
  items: Title[];
}) {
  if (items.length === 0) return null;

  return (
    <ContainerStagger className="section" as="section">
      <ContainerAnimated animation="left">
        <div className="section-head">
          <h2>{title}</h2>
          {href ? <Link className="nav-link" href={href}>Lihat semua</Link> : null}
        </div>
      </ContainerAnimated>
      <div className="rail">
        {items.map((item, i) => (
          <ContainerAnimated key={item.id} animation="bottom">
            <MovieCard3D title={item} />
          </ContainerAnimated>
        ))}
      </div>
    </ContainerStagger>
  );
}
```

Note: `ContainerStagger` needs to accept `as="section"` — update the component to use `React.ElementType`:

```typescript
interface ContainerStaggerProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  as?: React.ElementType;
}

export function ContainerStagger({ children, className, once = true, as: Tag = "div", ...props }: ContainerStaggerProps) {
  // ... same logic, use <motion.div> always, wrap in Tag if needed
  // Simpler: just use motion.div and className
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5.3: Update homepage with AnimatedRail**

Modify `app/page.tsx`:
```typescript
import { AnimatedRail } from "@/components/animated-rail";
// ... replace TitleRail usage with AnimatedRail where stagger is wanted
```

- [ ] **Step 5.4: Add scroll reveal to ranking page**

Modify `app/ranking/page.tsx` — wrap RankingSection in ContainerStagger + ContainerAnimated.

- [ ] **Step 5.5: Add scroll reveal to watch detail page**

Wrap sections in `app/watch/[slug]/page.tsx` (info panel, episode grid, related titles) with stagger.

- [ ] **Step 5.6: Commit**

```bash
git add components/ui/container-scroll.tsx components/animated-rail.tsx
git add app/page.tsx app/ranking/page.tsx app/watch/\[slug\]/page.tsx
git commit -m "feat: add scroll-reveal stagger animations across pages"
```

---

### Task 6: Micro-Interactions

**Files:**
- Modify: `app/globals.css` — add transition defaults
- Modify: `components/filter-bar.tsx` — animated selects
- Modify: `components/site-shell.tsx` — nav hover animations

- [ ] **Step 6.1: Enhanced button interactions**

Add to `app/globals.css`:
```css
.button, .icon-button, .nav-link, .meta-pill, .season-tab {
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, 
              border-color 180ms ease, box-shadow 180ms ease;
}

.button:active, .icon-button:active {
  transform: scale(0.97);
}

.meta-pill {
  transition: transform 180ms ease, background 180ms ease, color 180ms ease, 
              border-color 180ms ease, box-shadow 180ms ease;
}

.meta-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25);
}

.season-tab {
  transition: transform 180ms ease, border-color 180ms ease, 
              background 180ms ease, box-shadow 180ms ease;
}

.season-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.2);
}
```

- [ ] **Step 6.2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add micro-interactions to buttons, pills, and tabs"
```

---

### Task 7: Bento Grid Gallery

**Files:**
- Create: `components/ui/bento-grid.tsx`
- Create: `components/gallery-bento.tsx`
- Create: `app/browse/page.tsx` (new route)

- [ ] **Step 7.1: Create BentoGrid component**

```typescript
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid w-full auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

export function BentoItem({ children, className, colSpan = 1, rowSpan = 1 }: BentoItemProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-white/10 bg-surface/60 backdrop-blur-sm",
      colSpan > 1 ? `md:col-span-${colSpan}` : "",
      rowSpan > 1 ? `md:row-span-${rowSpan}` : "",
      className
    )}>
      {children}
    </div>
  );
}
```

- [ ] **Step 7.2: Create gallery-bento.tsx**

```typescript
"use client";

import { BentoGrid, BentoItem } from "@/components/ui/bento-grid";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { PosterImage } from "@/components/poster-image";
import type { Title } from "@/lib/data";

export function GalleryBento({ titles }: { titles: Title[] }) {
  return (
    <BentoGrid>
      {titles.slice(0, 7).map((title, index) => (
        <BentoItem
          key={title.id}
          colSpan={index === 0 ? 2 : 1}
          rowSpan={index === 0 ? 2 : 1}
        >
          <InteractiveCard tiltDegree={6} className="h-full">
            <a href={`/watch/${title.slug}`} className="block h-full">
              <PosterImage src={title.poster} alt={title.title} />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-bold text-white">{title.title}</h3>
                <p className="text-sm text-gray-300">{title.year} · {title.genres[0]}</p>
              </div>
            </a>
          </InteractiveCard>
        </BentoItem>
      ))}
    </BentoGrid>
  );
}
```

- [ ] **Step 7.3: Create browse page**

```typescript
import { getCatalogTitles } from "@/lib/catalog";
import { GalleryBento } from "@/components/gallery-bento";

export default async function BrowsePage() {
  const titles = await getCatalogTitles();
  const movies = titles.filter((t) => t.type === "movie");
  
  return (
    <div className="page">
      <div className="eyebrow">Eksplorasi</div>
      <h1 className="page-title">Browse 3D Gallery</h1>
      <p className="lead">Jelajahi koleksi dalam tampilan bento grid interaktif.</p>
      <GalleryBento titles={movies} />
    </div>
  );
}
```

Add link to browse page in `site-shell.tsx` navigation.

- [ ] **Step 7.4: Commit**

```bash
git add components/ui/bento-grid.tsx components/gallery-bento.tsx app/browse/page.tsx
git commit -m "feat: add bento grid gallery with 3D interactive cards"
```

---

### Task 8: Security Hardening

**Files:**
- Create: `lib/env.ts`
- Create: `lib/rate-limit.ts`
- Modify: `next.config.ts` — add CSP headers
- Modify: `middleware.ts` — route protection
- Modify: All server action files (add Zod validation)

- [ ] **Step 8.1: Create lib/env.ts**

```typescript
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optionalEnvVars = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "TMDB_ACCESS_TOKEN",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Add them to your .env.local file or Vercel project.`
    );
  }

  return true;
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return { url, key };
}
```

- [ ] **Step 8.2: Add CSP headers in next.config.ts**

Modify `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval for three.js
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co https://*.unsplash.com https://*.wikipedia.org https://archive.org",
            "media-src 'self' https://*.supabase.co https://archive.org",
            "frame-src 'self' https://web.nxsha.app https://archive.org",
            "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://o450000.ingest.sentry.io",
            "font-src 'self' data:",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ];
},
```

- [ ] **Step 8.3: Create lib/rate-limit.ts**

```typescript
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateMap) {
      if (now > record.resetAt) rateMap.delete(key);
    }
  }, 300000);
}
```

- [ ] **Step 8.4: Protect studio routes in middleware**

Modify `middleware.ts` — add before the return:
```typescript
// Protect studio routes
if (request.nextUrl.pathname.startsWith("/studio")) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !request.nextUrl.pathname.startsWith("/studio/login")) {
    return NextResponse.redirect(new URL("/studio/login", request.url));
  }
}
```

- [ ] **Step 8.5: Add Zod validation to login actions**

Modify `app/login/actions.ts`:
```typescript
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function signIn(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.errors[0].message)}`);
  }

  // ... existing logic
}
```

- [ ] **Step 8.6: Commit**

```bash
git add lib/env.ts lib/rate-limit.ts next.config.ts middleware.ts app/login/actions.ts
git commit -m "feat: add security hardening - CSP, rate limiting, Zod validation, route protection"
```

---

### Task 9: SEO & Metadata

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/opengraph-image.tsx`
- Modify: `app/watch/[slug]/page.tsx` — add generateMetadata
- Modify: `app/watch/[slug]/play/page.tsx` — add generateMetadata

- [ ] **Step 9.1: Create app/sitemap.ts**

```typescript
import { getCatalogTitles } from "@/lib/catalog";

export default async function sitemap() {
  const baseUrl = "https://movie-stream.vercel.app";
  const titles = await getCatalogTitles();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/series`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
  ];

  const titlePages = titles.map((title) => ({
    url: `${baseUrl}/watch/${title.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...titlePages];
}
```

- [ ] **Step 9.2: Create app/robots.ts**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/series", "/ranking", "/search", "/watch"],
        disallow: ["/studio", "/admin", "/api/"],
      },
    ],
    sitemap: "https://movie-stream.vercel.app/sitemap.xml",
  };
}
```

- [ ] **Step 9.3: Add generateMetadata to watch detail pages**

In `app/watch/[slug]/page.tsx`, add before the default export:
```typescript
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { getCatalogTitleBySlug } = await import("@/lib/catalog");
  const title = await getCatalogTitleBySlug(slug);
  
  if (!title) {
    return { title: "Not Found - IMOV" };
  }

  return {
    title: `${title.title} - IMOV`,
    description: title.synopsis.slice(0, 160),
    openGraph: {
      title: `${title.title} - IMOV`,
      description: title.synopsis.slice(0, 160),
      type: title.type === "movie" ? "video.movie" : "video.tv_show",
      images: [{ url: title.poster, width: 500, height: 750 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title.title} - IMOV`,
      description: title.synopsis.slice(0, 160),
      images: [title.poster],
    },
  };
}
```

- [ ] **Step 9.4: Add JSON-LD to detail pages**

In `app/watch/[slug]/page.tsx`, add inside the JSX (before closing section):
```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": title.type === "movie" ? "Movie" : "TVSeries",
      name: title.title,
      description: title.synopsis,
      image: title.poster,
      datePublished: String(title.year),
      ...(title.imdbRating ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: title.imdbRating,
          ratingCount: title.imdbVotes,
          bestRating: 10,
        },
      } : {}),
    }),
  }}
/>
```

- [ ] **Step 9.5: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/watch/\[slug\]/page.tsx app/watch/\[slug\]/play/page.tsx
git commit -m "feat: add SEO - sitemap, robots, metadata, JSON-LD"
```

---

### Task 10: Auth & User Features

**Files:**
- Create: `app/register/page.tsx`
- Modify: `app/login/page.tsx` — replace notFound with real form
- Create: `app/profile/page.tsx`
- Create: `app/profile/favorites/page.tsx`
- Modify: `app/page.tsx` — add "Lanjutkan Nonton" rail

- [ ] **Step 10.1: Build proper login page**

Replace `app/login/page.tsx`:
```typescript
import Link from "next/link";
import { signIn } from "@/app/login/actions";
import { Clapperboard } from "lucide-react";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page" style={{ maxWidth: 420, margin: "0 auto", paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span className="brand-mark" style={{ width: 56, height: 56, margin: "0 auto", fontSize: 24, display: "grid", placeItems: "center" }}>
          <Clapperboard size={28} />
        </span>
        <h1 className="page-title" style={{ fontSize: "clamp(24px, 4vw, 32px)" }}>Masuk ke IMOV</h1>
        <p className="lead">Masuk untuk menyimpan favorit dan melanjutkan tontonan.</p>
      </div>

      {params?.error ? (
        <div className="panel" style={{ color: "var(--danger)", marginBottom: 16, padding: "12px 16px" }}>
          {params.error}
        </div>
      ) : null}

      <form action={signIn} className="studio-form">
        <label className="field">
          Email
          <input className="input" type="email" name="email" placeholder="contoh@email.com" required />
        </label>
        <label className="field">
          Password
          <input className="input" type="password" name="password" placeholder="Minimal 6 karakter" required />
        </label>
        <input type="hidden" name="next" value={params?.next ?? "/"} />
        <button className="button" type="submit" style={{ width: "100%", justifyContent: "center" }}>
          Masuk
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link className="nav-link" href="/register">Belum punya akun? Daftar</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 10.2: Create register page**

`app/register/page.tsx` — similar form, calls `supabase.auth.signUp()`.

- [ ] **Step 10.3: Create profile page**

`app/profile/page.tsx` — use `createClient()` to get user, show email and link to favorites.

- [ ] **Step 10.4: Wire favorites button**

In `app/watch/[slug]/page.tsx`, update the Favorit button to use Server Action.

- [ ] **Step 10.5: Commit**

```bash
git add app/login/page.tsx app/register/page.tsx app/profile/ app/page.tsx
git commit -m "feat: add auth pages and user features"
```

---

### Task 11: Performance Optimization

**Files:**
- Modify: `lib/catalog.ts` — add React.cache()
- Modify: `next.config.ts` — verify image config
- Modify: `app/layout.tsx` — font optimization

- [ ] **Step 11.1: Add React.cache() to catalog**

```typescript
import { cache } from "react";

export const getCatalogCached = cache(async () => {
  const fromSupabase = await fetchSupabaseTitles();
  if (fromSupabase.length === 0) return fallbackTitles;
  // ... rest of merge logic
});
```

- [ ] **Step 11.2: Add font optimization**

In `app/layout.tsx`, use `next/font`:
```typescript
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
```

- [ ] **Step 11.3: Commit**

```bash
git add lib/catalog.ts app/layout.tsx
git commit -m "perf: add caching, font optimization, image config"
```

---

### Task 12: Testing

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/__tests__/images.test.ts`
- Create: `lib/__tests__/nxsha.test.ts`
- Create: `lib/__tests__/data.test.ts`

- [ ] **Step 12.1: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 12.2: Write image tests**

```typescript
import { describe, it, expect } from "vitest";
import { tmdbImage, cssImage, posterImage } from "@/lib/images";

describe("tmdbImage", () => {
  it("returns full TMDB URL for relative path", () => {
    expect(tmdbImage("/abc.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
  });

  it("returns full URL as-is if already absolute", () => {
    expect(tmdbImage("https://example.com/img.jpg")).toBe("https://example.com/img.jpg");
  });

  it("returns empty string for empty input", () => {
    expect(tmdbImage("")).toBe("");
  });
});

describe("cssImage", () => {
  it("returns gradient fallback for null/undefined", () => {
    expect(cssImage(null)).toContain("linear-gradient");
    expect(cssImage(undefined)).toContain("linear-gradient");
  });

  it("wraps TMDB path as url()", () => {
    expect(cssImage("/test.jpg")).toContain("url(");
  });
});

describe("posterImage", () => {
  it("returns empty string for null input", () => {
    expect(posterImage(null)).toBe("");
  });

  it("extracts URL from css image value", () => {
    const result = posterImage("url('https://image.tmdb.org/t/p/w342/test.jpg')");
    expect(result).toContain("test.jpg");
  });
});
```

- [ ] **Step 12.3: Write nxsha tests**

```typescript
import { describe, it, expect } from "vitest";
import { buildNxshaEmbedUrl, NXSHA_EMBED_LABEL } from "@/lib/nxsha";

describe("buildNxshaEmbedUrl", () => {
  it("builds movie URL from tmdbId", () => {
    const url = buildNxshaEmbedUrl({ tmdbId: 550, type: "movie" });
    expect(url).toContain("web.nxsha.app/embed/movie/550");
    expect(url).toContain("sub=id");
    expect(url).toContain("lang=id");
  });

  it("builds series URL from tmdbId", () => {
    const url = buildNxshaEmbedUrl({ tmdbId: 1399, type: "series", seasonNumber: 2, episodeNumber: 5 });
    expect(url).toContain("embed/tv/1399/2/5");
  });

  it("returns null when no media ID provided", () => {
    expect(buildNxshaEmbedUrl({ type: "movie" })).toBeNull();
  });

  it("uses imdbId as fallback when tmdbId missing", () => {
    const url = buildNxshaEmbedUrl({ imdbId: "tt0111161", type: "movie" });
    expect(url).toContain("tt0111161");
  });
});
```

- [ ] **Step 12.4: Write data tests**

```typescript
import { describe, it, expect } from "vitest";
import { getFilteredTitles, titles } from "@/lib/data";

describe("getFilteredTitles", () => {
  it("returns all titles with no params", () => {
    expect(getFilteredTitles({}).length).toBeGreaterThan(0);
  });

  it("filters by type movie", () => {
    const movies = getFilteredTitles({ type: "movie" });
    expect(movies.every((t) => t.type === "movie")).toBe(true);
  });

  it("filters by genre", () => {
    const filtered = getFilteredTitles({ genre: "Action" });
    expect(filtered.every((t) => t.genres.includes("Action"))).toBe(true);
  });

  it("filters by search query", () => {
    const results = getFilteredTitles({ q: "batman" });
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for non-matching search", () => {
    expect(getFilteredTitles({ q: "xyznonexistent12345" }).length).toBe(0);
  });
});
```

- [ ] **Step 12.5: Run tests to verify**

Run:
```bash
cd /home/can/Document/movie-stream && npx vitest run
```
Expected: All tests PASS.

- [ ] **Step 12.6: Commit**

```bash
git add vitest.config.ts lib/__tests__/
git commit -m "test: add unit tests for images, nxsha, and data utilities"
```

---

### Task 13: CI/CD & Monitoring

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `scripts/backup.sh`
- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`

- [ ] **Step 13.1: Create CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx next lint
      - run: npx vitest run
```

- [ ] **Step 13.2: Create backup script**

```bash
#!/bin/bash
# scripts/backup.sh — Supabase database backup
pg_dump \
  --dbname="$SUPABASE_DB_URL" \
  --format=custom \
  --file="./backups/$(date +%Y-%m-%d_%H%M%S).dump" \
  --no-owner \
  --exclude-table-data='audit_events'
echo "Backup saved to backups/$(date +%Y-%m-%d_%H%M%S).dump"
```

- [ ] **Step 13.3: Install Sentry**

```bash
cd /home/can/Document/movie-stream
npx @sentry/wizard@latest -i nextjs
```
(If interactive, choose Next.js project, skip for now — can be done manually.)

- [ ] **Step 13.4: Commit**

```bash
git add .github/workflows/ci.yml scripts/backup.sh
chmod +x scripts/backup.sh
git commit -m "ci: add CI workflow and backup script"
```

---

## Validation

```bash
# Full build check
cd /home/can/Document/movie-stream && npm run build

# Type check
npx tsc --noEmit

# Lint
npx next lint

# Test
npx vitest run

# Test E2E (if configured)
npx playwright test
```

## Risks

| Risk | Mitigation |
|---|---|
| Three.js bundle size (+100KB gzip) | Dynamic import Ethereal component, code-split |
| Framer Motion + Three.js conflict | Separate concerns: Framer for UI, Three.js for background |
| Page transition flash on slow networks | AnimatePresence with `mode="wait"` + minimal duration |
| 3D tilt not working on mobile | Disable tilt on touch devices via pointer media query |
| Reduced-motion violation | Always check `prefers-reduced-motion: reduce` |
