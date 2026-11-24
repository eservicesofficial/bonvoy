"use client";

/**
 * Bonvoy animation toolkit (requirement 19).
 *
 * Built on framer-motion v12 (free / MIT, already part of the project) plus a
 * small CSS layer in globals.css. Everything animates transform / opacity only
 * so transitions stay on the compositor thread (~60 FPS). The whole app is
 * wrapped in <MotionConfig reducedMotion="user">, which automatically drops
 * transform/layout animations when the device asks for reduced motion
 * (Android accessibility setting) — matching requirement G.
 */

import {
  motion,
  MotionConfig,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/components/bonvoy/store";

export { MotionConfig as BvMotionConfig };

/* ------------------------------------------------------------------ */
/* Easing / timing vocabulary shared across the app                    */
/* ------------------------------------------------------------------ */

/** Signature ease used for entrances (fast start, soft landing). */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Gentle ease for exits. */
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];
/** Spring preset for press feedback / tab indicator. */
export const SPRING = { type: "spring" as const, stiffness: 480, damping: 34, mass: 0.9 };

/* ------------------------------------------------------------------ */
/* A. Press feedback — subtle press-down scale for buttons             */
/* ------------------------------------------------------------------ */

export function Pressable({
  children,
  className,
  scale = 0.96,
  ...rest
}: HTMLMotionProps<"button"> & { scale?: number }) {
  return (
    <motion.button
      whileTap={{ scale }}
      transition={SPRING}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** Card-level touch feedback (gentler than buttons). */
export function TapCard({
  children,
  className,
  scale = 0.98,
  ...rest
}: HTMLMotionProps<"div"> & { scale?: number }) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={SPRING}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* E. Screen transitions — direction-aware fade + slide                */
/* ------------------------------------------------------------------ */

export type ScreenKind = "tab" | "sub" | "profile";

/**
 * Wraps every screen/surface. Direction comes from the navigation store
 * ("forward" on push, "back" on popstate), so Back reverses the motion.
 *
 * - tabs:    horizontal slide + fade (Home → Account → …)
 * - sub:     upward slide + fade (Profile → Wallet → Scan, sub pages, admin)
 * - profile: full-height slide-up sheet (My Profile opens/closes vertically)
 *
 * With reduced motion MotionConfig strips the transforms, leaving a soft fade.
 */
export function ScreenTransition({
  kind,
  screenKey,
  children,
}: {
  kind: ScreenKind;
  screenKey: string;
  children: ReactNode;
}) {
  const { navDir } = useApp();
  const forward = navDir !== "back";

  const variants = {
    initial:
      kind === "tab"
        ? { opacity: 0, x: forward ? 26 : -26, z: 0 }
        : kind === "profile"
          ? { opacity: forward ? 0 : 1, y: "100%" }
          : { opacity: 0, y: forward ? 44 : 20 },
    animate:
      kind === "profile"
        ? { opacity: 1, y: "0%" }
        : { opacity: 1, x: 0, y: 0 },
    exit:
      kind === "tab"
        ? { opacity: 0, x: forward ? -20 : 20 }
        : kind === "profile"
          ? { opacity: 1, y: "100%" }
          : { opacity: 0, y: forward ? 26 : 44 },
  } as const;

  return (
    <motion.div
      key={screenKey}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={
        kind === "profile"
          ? { duration: 0.4, ease: forward ? EASE_OUT : EASE_IN }
          : { duration: 0.32, ease: EASE_OUT }
      }
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* D. Staggered entrance — profile header / menu items                 */
/* ------------------------------------------------------------------ */

export function Stagger({
  children,
  className,
  delay = 0,
  step = 0.055,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  step?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: EASE_OUT } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* B/F. CountUp — smooth value transitions for numbers                 */
/* ------------------------------------------------------------------ */

/** Animates from the previous value to the new one; renders formatted text. */
export function CountUp({
  value,
  duration = 1.1,
  format = (n: number) => Math.round(n).toLocaleString("en-US"),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    if (from === value) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / (duration * 1000), 1);
      // easeOutCubic
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * e;
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration, reduce]);

  return <span className={className}>{format(display)}</span>;
}

/* ------------------------------------------------------------------ */
/* C. Skeletons + smooth swap to real content                          */
/* ------------------------------------------------------------------ */

export function Skel({ className }: { className: string }) {
  return <div className={`bv-skel rounded-[10px] ${className}`} aria-hidden />;
}

/** Content wrapper: fades in (and slightly rises) when it mounts for real. */
export function FadeIn({
  children,
  className,
  duration = 0.35,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
