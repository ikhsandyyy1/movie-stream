"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ParallaxFloatingProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum translation offset in pixels on each axis.
   * @default 20
   */
  offset?: number;
  /**
   * Scale of the parallax effect on mouse distance.
   * Lower = more subtle.
   * @default 1
   */
  sensitivity?: number;
  /**
   * Whether to reverse the parallax direction.
   * @default false
   */
  reverse?: boolean;
}

export function ParallaxFloating({
  children,
  className,
  offset = 20,
  sensitivity = 1,
  reverse = false,
}: ParallaxFloatingProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const dir = reverse ? -1 : 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
      style={{
        transform: prefersReduced
          ? "none"
          : `translateX(${mousePos.x * offset * dir * sensitivity}px) translateY(${mousePos.y * offset * dir * sensitivity}px)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
}
