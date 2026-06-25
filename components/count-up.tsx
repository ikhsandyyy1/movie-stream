"use client";

import { useEffect, useState, useRef } from "react";

export function CountUp({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  useEffect(() => {
    if (prefersReduced) {
      setCount(value);
      return;
    }

    startRef.current = null;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, prefersReduced]);

  return <>{count.toLocaleString()}</>;
}
