"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
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
  glowColor,
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
  });
  const mouseYSpring = useSpring(y, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
  });

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${tiltDegree}deg`, `-${tiltDegree}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${tiltDegree}deg`, `${tiltDegree}deg`]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);

    // Update CSS custom properties for glow effect positioning
    e.currentTarget.style.setProperty(
      "--mouse-x",
      `${(mouseX / width) * 100}%`
    );
    e.currentTarget.style.setProperty(
      "--mouse-y",
      `${(mouseY / height) * 100}%`
    );
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
        rotateY: prefersReducedMotion ? 0 : rotateY,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative", className)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
      {glowColor && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
