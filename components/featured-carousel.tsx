"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import type { Title } from "@/lib/data";

export function FeaturedCarousel({ items }: { items: Title[] }) {
  const slides = useMemo(() => items.slice(0, 5), [items]);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const current = slides[active] ?? slides[0];
  const shouldReduceMotion = useReducedMotion();

  const goTo = (index: number, nextDirection: "next" | "prev" = "next") => {
    setDirection(nextDirection);
    setActive((index + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setDirection("next");
      setActive((index) => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (!current) return null;

  const playHref =
    current.type === "series" && current.seasons?.[0]?.episodes[0]
      ? `/watch/${current.slug}/season/${current.seasons[0].seasonNumber}/episode/${current.seasons[0].episodes[0].episodeNumber}`
      : `/watch/${current.slug}/play`;

  return (
    <section
      className="hero featured-carousel relative flex w-full flex-col justify-end overflow-hidden"
      style={{
        minHeight: "550px",
        height: "70vh",
      }}
    >
      {/* Backdrop with mask-image gradient (nxsha style) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: current.backdrop,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(black 50%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/30 md:to-black/40" />
      </div>

      {/* Prev / Next nav arrows — hidden on mobile like nxsha */}
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 md:flex"
            aria-label="Previous banner"
            onClick={() => goTo(active - 1, "prev")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 md:flex"
            aria-label="Next banner"
            onClick={() => goTo(active + 1, "next")}
          >
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}

      {/* Content — centered like nxsha */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex w-full flex-col justify-end px-4 pb-12 pt-32 text-center md:px-8 md:pb-24"
          data-direction={direction}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-1">
            {/* Yellow "Now Streaming" badge */}
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow/35 bg-yellow/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow">
              Now Streaming
            </div>

            {/* Title */}
            <h1 className="mb-3 text-4xl font-bold font-display tracking-tight text-white line-clamp-1 md:text-6xl">
              {current.title}
            </h1>

            {/* Rating + meta pills */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              {current.imdbRating ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-sm text-white backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FFC300" stroke="#FFC300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="font-semibold text-yellow">{current.imdbRating.toFixed(1)}</span>
                </span>
              ) : null}
              <span className="rounded-full bg-black/45 px-3 py-1 text-sm text-gray-100 backdrop-blur-sm">
                {current.year}
              </span>
              <span className="rounded-full bg-black/45 px-3 py-1 text-sm text-gray-100 backdrop-blur-sm">
                {current.rating}
              </span>
            </div>

            {/* Synopsis line-clamped */}
            <p className="mx-auto mb-6 max-w-3xl text-sm leading-relaxed text-gray-200 line-clamp-2 md:text-base">
              {current.synopsis}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                className="btn-yellow flex items-center justify-center gap-2 whitespace-nowrap w-[85%] max-w-sm px-6 py-3.5 text-sm md:w-auto md:px-8 md:py-4 md:text-base"
                href={playHref}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                  <polygon points="3,1 14,8 3,15" />
                </svg>
                Watch Now
              </Link>
              <Link
                className="flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-sm md:px-8 md:py-4 md:text-base rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70"
                href={`/watch/${current.slug}`}
              >
                <Info size={18} />
                Details
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator (mobile + desktop) */}
      {slides.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Tampilkan ${slide.title}`}
              aria-current={index === active ? "true" : undefined}
              className={`h-2 w-2 rounded-full border-0 transition-all duration-300 ${
                index === active
                  ? "w-7 bg-gradient-to-r from-yellow to-orange-500"
                  : "bg-white/40 hover:bg-white/70"
              }`}
              onClick={() => goTo(index, index > active ? "next" : "prev")}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
