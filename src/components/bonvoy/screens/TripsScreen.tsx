"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, MessageSquareMore } from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { Pressable } from "@/components/bonvoy/motion";

/** Luggage illustration matching the PDF empty state (orange backpack + suitcase). */
function LuggageArt() {
  return (
    <svg width="270" height="240" viewBox="0 0 270 240" aria-hidden>
      {/* mountains */}
      <path d="M0 200 L60 120 L110 175 L160 95 L215 160 L270 110 L270 240 L0 240 Z" fill="#2E2C2B" />
      <path d="M0 240 L45 170 L95 215 L150 150 L205 210 L270 165 L270 240 Z" fill="#262423" opacity="0.9" />
      {/* suitcase */}
      <rect x="140" y="92" width="64" height="102" rx="10" fill="#6E6C6B" />
      <rect x="148" y="100" width="48" height="30" rx="6" fill="#7C7A79" opacity="0.8" />
      <rect x="160" y="78" width="24" height="18" rx="4" fill="#5A5857" />
      <rect x="164" y="70" width="16" height="10" rx="4" fill="#6E6C6B" />
      <rect x="172" y="60" width="6" height="14" rx="2" fill="#8B8988" />
      <rect x="140" y="112" width="64" height="4" fill="#5A5857" opacity="0.7" />
      <circle cx="152" cy="196" r="6" fill="#3E3C3B" />
      <circle cx="192" cy="196" r="6" fill="#3E3C3B" />
      {/* backpack */}
      <path d="M62 128 q0 -34 34 -34 q34 0 34 34 l0 52 q0 14 -14 14 l-40 0 q-14 0 -14 -14 Z" fill="#E4793C" />
      <path d="M78 100 q18 -18 36 0" stroke="#C4612C" strokeWidth="7" fill="none" />
      <rect x="74" y="146" width="44" height="34" rx="8" fill="#D96C30" />
      <rect x="88" y="152" width="16" height="12" rx="4" fill="#F2E9E4" opacity="0.9" />
      <circle cx="96" cy="158" r="7" fill="#B84E1F" />
      <circle cx="96" cy="158" r="3" fill="#F2E9E4" />
      <rect x="62" y="168" width="12" height="10" rx="3" fill="#C4612C" />
    </svg>
  );
}

const TABS = ["Current", "Past", "Canceled"] as const;

export default function TripsScreen() {
  const { switchTab } = useApp();
  const [active, setActive] = useState<(typeof TABS)[number]>("Current");

  const emptyText =
    active === "Current"
      ? "You have no upcoming trips. When you do, they'll appear here."
      : active === "Past"
        ? "You have no past trips. When you do, they'll appear here."
        : "You have no canceled trips. When you do, they'll appear here.";

  return (
    <div className="absolute inset-0" style={{ background: "var(--bv-trips-gradient)" }}>
      <div className="absolute inset-x-0 bottom-0 top-[44px] bg-[#2E2C2B] rounded-t-[26px] overflow-hidden">
        <div className="h-full overflow-y-auto no-scrollbar px-5 pt-6 pb-[110px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[26px] font-bold text-white">Trips</h1>
            <button aria-label="Trips support chat" className="text-white">
              <MessageSquareMore size={24} strokeWidth={1.8} />
            </button>
          </div>

          {/* Tabs — underline glides between tabs (layout animation) */}
          <div className="mt-4 flex gap-7 border-b border-[#3A3836]">
            {TABS.map((t) => {
              const on = t === active;
              return (
                <button
                  key={t}
                  onClick={() => setActive(t)}
                  className={`relative pb-3 text-[16px] ${on ? "text-white font-semibold" : "text-[#A19E9B] font-medium"}`}
                >
                  {t}
                  {on && (
                    <motion.span
                      layoutId="trips-tab-underline"
                      transition={{ type: "spring", stiffness: 480, damping: 36 }}
                      className="absolute left-0 right-0 -bottom-[1.5px] h-[3px] rounded-full bg-[var(--bv-tab-indicator)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#A19E9B] flex items-center justify-center gap-2">
            Missing an upcoming stay? <Info size={14} className="opacity-80" />
          </p>

          <div
            key={active}
            className="mt-2 flex justify-center"
            style={{ animation: "bv-fade-in 0.3s cubic-bezier(0.22,1,0.36,1)" }}
          >
            <LuggageArt />
          </div>

          <div className="mt-4 border border-dashed border-[#6B6866] rounded-[10px] px-6 pt-9 pb-9 text-center">
            <p className="text-[16px] text-white leading-relaxed">{emptyText}</p>
            <Pressable
              onClick={() => switchTab("book")}
              scale={0.96}
              className="mt-6 bg-white text-[#1B1918] text-[15px] font-semibold rounded-full px-6 py-[11px]"
            >
              Book a Trip
            </Pressable>
          </div>
        </div>
      </div>
    </div>
  );
}
