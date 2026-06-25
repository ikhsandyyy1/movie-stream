"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import type { Title } from "@/lib/data";
import { LayerParallaxHero } from "@/components/ui/layer-parallax-hero";

export function FeaturedCarousel({ items }: { items: Title[] }) {
  const slides = useMemo(() => items.slice(0, 5), [items]);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const current = slides[active] ?? slides[0];

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

  const shouldReduceMotion = useReducedMotion();

  if (!current) return null;

  const playHref =
    current.type === "series" && current.seasons?.[0]?.episodes[0]
      ? `/watch/${current.slug}/season/${current.seasons[0].seasonNumber}/episode/${current.seasons[0].episodes[0].episodeNumber}`
      : `/watch/${current.slug}/play`;

  return (
    <LayerParallaxHero
      className="hero featured-carousel"
      style={{ "--hero-image": current.backdrop } as React.CSSProperties}
      layers={[
        {
          depth: 30,
          children: (
            <div
              style={{
                ...(current.backdrop
                  ? {
                      backgroundImage: current.backdrop,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(4px)",
                      opacity: 0.6,
                      transform: "scale(1.1)",
                    }
                  : {}),
                position: "absolute",
                inset: 0,
              }}
            />
          ),
        },
        {
          depth: 15,
          children: (
            <div
              style={{
                ...(current.backdrop
                  ? {
                      backgroundImage: current.backdrop,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}),
                position: "absolute",
                inset: 0,
              }}
            />
          ),
        },
      ]}
    >
      <div className="featured-poster-strip" aria-hidden="true">
        {slides.map((slide, index) => (
          <button
            className={`featured-thumb${index === active ? " active" : ""}`}
            key={slide.id}
            onClick={() => goTo(index, index > active ? "next" : "prev")}
            tabIndex={-1}
            type="button"
            style={{
              transform: `translateY(${index === active ? -8 : 0}px) perspective(600px) rotateY(${(index - active) * 5}deg)`,
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ backgroundImage: `url('${slide.poster}')` }} />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: direction === "next" ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === "next" ? -30 : 30 }}
          transition={{ duration: 0.3 }}
          className="hero-content featured-copy"
          data-direction={direction}
        >
          <div className="eyebrow">Featured hari ini</div>
          <h1>{current.title}</h1>
          <p>{current.synopsis}</p>
          <div className="meta-row">
            <span className="meta-pill">{current.year}</span>
            <span className="meta-pill">{current.rating}</span>
            <span className="meta-pill">{current.duration}</span>
            <span className="meta-pill">{current.genres.slice(0, 3).join(", ")}</span>
          </div>
          <div className="actions-row">
            <Link
              className="button relative overflow-hidden group"
              href={playHref}
              style={{
                boxShadow: "var(--glow-primary)",
                transition: "transform 0.2s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (shouldReduceMotion) return;
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 40px var(--primary-strong)";
              }}
              onMouseLeave={(e) => {
                if (shouldReduceMotion) return;
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "var(--glow-primary)";
              }}
            >
              <Play size={19} />
              Putar Sekarang
            </Link>
            <Link className="button secondary" href={`/watch/${current.slug}`}>
              <Info size={19} />
              Detail
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 ? (
        <div className="featured-controls" aria-label="Kontrol featured">
          <button className="icon-button" type="button" aria-label="Featured sebelumnya" onClick={() => goTo(active - 1, "prev")}>
            <ChevronLeft size={20} />
          </button>
          <div className="featured-dots" aria-label="Pilih featured">
            {slides.map((slide, index) => (
              <button
                aria-label={`Tampilkan ${slide.title}`}
                aria-current={index === active ? "true" : undefined}
                className={index === active ? "active" : ""}
                key={slide.id}
                onClick={() => goTo(index, index > active ? "next" : "prev")}
                type="button"
              />
            ))}
          </div>
          <button className="icon-button" type="button" aria-label="Featured berikutnya" onClick={() => goTo(active + 1, "next")}>
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </LayerParallaxHero>
  );
}
