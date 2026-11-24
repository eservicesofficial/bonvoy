"use client";

import { motion } from "framer-motion";
import { House, CalendarDays, Briefcase, Heart, UserRound } from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { Pressable } from "@/components/bonvoy/motion";
import type { Tab } from "@/lib/bonvoy/types";

const TABS: { key: Tab; label: string; icon: typeof House }[] = [
  { key: "home", label: "Home", icon: House },
  { key: "book", label: "Book", icon: CalendarDays },
  { key: "trips", label: "Trips", icon: Briefcase },
  { key: "wishlists", label: "Wishlists", icon: Heart },
  { key: "account", label: "Account", icon: UserRound },
];

export default function BottomNav() {
  const { tab, switchTab } = useApp();
  const activeIndex = TABS.findIndex((t) => t.key === tab);

  return (
    <nav
      aria-label="Primary"
      className="absolute bottom-0 inset-x-0 bg-[#343130] pt-0 pb-[calc(6px+env(safe-area-inset-bottom))] select-none"
    >
      {/* active-tab themed indicator — glides between tabs on a spring (transform-only, 60 FPS).
          Colour follows the global membership theme via --bv-indicator. */}
      <div className="relative h-[3px]">
        <motion.div
          className="absolute top-0 h-[3px] w-1/5 rounded-b-full bg-[var(--bv-indicator)]"
          initial={false}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.8 }}
        />
      </div>
      <div className="grid grid-cols-5 pt-[10px]">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              scale={0.9}
              onClick={() => switchTab(key)}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-[5px] py-1 transition-colors duration-200 ${
                active ? "text-white" : "text-[#A19E9B]"
              }`}
            >
              <motion.span
                initial={false}
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="flex"
              >
                <Icon
                  size={23}
                  strokeWidth={active ? 2.4 : 1.9}
                  fill={active && (key === "home" || key === "wishlists") ? "currentColor" : "none"}
                />
              </motion.span>
              <span className={`text-[12px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </Pressable>
          );
        })}
      </div>
    </nav>
  );
}
