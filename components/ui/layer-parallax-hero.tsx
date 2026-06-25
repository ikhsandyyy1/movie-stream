"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LayerParallaxHeroProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  layers?: {
    depth: number;
    children: React.ReactNode;
  }[];
}

export function LayerParallaxHero({ children, className, style, layers = [] }: LayerParallaxHeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePos({ x, y });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
      style={{ perspective: "1000px", ...style }}
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
