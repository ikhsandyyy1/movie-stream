"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
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
    <section className="hero-nxsha" style={{ "--hero-image": current.backdrop } as React.CSSProperties}>
      {/* Prev / Next nav arrows */}
      {slides.length > 1 ? (
        <>
          <button type="button" className="hero-nav hero-nav-prev" aria-label="Previous banner" onClick={() => goTo(active - 1, "prev")}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hero-nav hero-nav-next" aria-label="Next banner" onClick={() => goTo(active + 1, "next")}>
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="hero-nxsha-content"
          data-direction={direction}
        >
          <div className="hero-nxsha-inner">
            {/* "Now Streaming" badge */}
            <div className="hero-badge">Now Streaming</div>

            {/* Title */}
            <h1 className="hero-nxsha-title">{current.title}</h1>

            {/* Rating + meta */}
            <div className="hero-nxsha-meta">
              {current.imdbRating ? (
                <span className="hero-nxsha-pill hero-nxsha-pill-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC300" stroke="#FFC300" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>{current.imdbRating.toFixed(1)}</span>
                </span>
              ) : null}
              <span className="hero-nxsha-pill">{current.year}</span>
              <span className="hero-nxsha-pill">{current.rating}</span>
            </div>

            {/* Synopsis */}
            <p className="hero-nxsha-synopsis">{current.synopsis}</p>

            {/* CTA */}
            <div className="hero-nxsha-actions">
              <Link className="btn-yellow" href={playHref}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15" /></svg>
                Watch Now
              </Link>
              <Link className="btn-outline" href={`/watch/${current.slug}`}>
                <Info size={18} />
                Details
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {slides.length > 1 ? (
        <div className="hero-nxsha-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Tampilkan ${slide.title}`}
              aria-current={index === active ? "true" : undefined}
              className={`hero-nxsha-dot${index === active ? " active" : ""}`}
              onClick={() => goTo(index, index > active ? "next" : "prev")}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
