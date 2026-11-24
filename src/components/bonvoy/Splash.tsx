"use client";

/**
 * App launch screen:
 * pure black background with ONLY the user-supplied Bonvoy logo centered —
 * no decorative curves, no spinner, nothing else (user requirement).
 * A subtle fade-in, then a smooth cross-fade into the Home screen.
 * Reduced-motion devices get a short, static fade instead.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { EASE_OUT } from "@/components/bonvoy/motion";

/** Pure black splash — the icon's own black backdrop blends seamlessly. */
const SPLASH_BG = "#000000";

export default function Splash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  // Splash duration, then hand over to the app (parent unmounts us with a fade).
  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 900 : 1600);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      className="absolute inset-0 z-[90] flex flex-col items-center justify-center"
      style={{ background: SPLASH_BG }}
      exit={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
      transition={{ duration: reduce ? 0.25 : 0.5, ease: EASE_OUT }}
    >
      {/* Supplied Bonvoy logo — the only element on the opening screen */}
      <motion.img
        src="/icons/icon-512.png?v=8"
        alt="Bonvoy"
        className="w-[118px] h-[118px]"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0.4 : 0.7, ease: EASE_OUT }}
      />
    </motion.div>
  );
}
