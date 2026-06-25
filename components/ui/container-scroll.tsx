"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type AnimationType = "top" | "bottom" | "left" | "right" | "blur" | "z" | "fade";

const getVariants = (animate: AnimationType) => {
  const isLeft = animate === "left";
  const isRight = animate === "right";
  const isTop = animate === "top";
  const isBottom = animate === "bottom";
  const isZ = animate === "z";
  const isBlur = animate === "blur";

  return {
    hidden: {
      x: isLeft ? "-30px" : isRight ? "30px" : 0,
      y: isTop ? "-20px" : isBottom ? "20px" : 0,
      scale: isZ ? 0.9 : 1,
      filter: isBlur ? "blur(8px)" : "blur(0px)",
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20, mass: 0.8 },
    },
  } as const;
};

interface ContainerStaggerProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}

export function ContainerStagger({
  children,
  className,
  once = true,
  ...props
}: ContainerStaggerProps) {
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
  children,
  className,
  animation = "fade",
  ...props
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
