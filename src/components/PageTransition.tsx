"use client";

import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const searchParams = useSearchParams();
  const direction = searchParams.get("direction") || "forward";

  const variants = {
    initial: {
      x: direction === "back" ? "-100%" : "100%",
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === "back" ? "100%" : "-100%",
      opacity: 0,
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
