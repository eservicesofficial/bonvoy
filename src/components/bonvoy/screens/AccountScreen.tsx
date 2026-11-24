"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import {
  UserRound,
  Info,
  X,
  Wifi,
  BadgePercent,
  KeyRound,
  Gift,
  Award,
  Star,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { fmtInt, fmtSpend } from "@/lib/bonvoy/types";
import type { MembershipTheme } from "@/lib/bonvoy/theme";
import { useToast } from "@/hooks/use-toast";
import { CountUp, EASE_OUT, FadeIn, Pressable, Skel, TapCard } from "@/components/bonvoy/motion";

const MILESTONES = [10, 25, 50, 75, 100];
const TARGET = 100;

/**
 * Membership progress gauge (requirement 19-B, matches the reference video):
 * the arc sweeps from its starting point to the actual night count, the centre
 * number counts up in sync, and all five milestones (10, 25, 50, 75, 100) sit
 * at their exact positions on the semicircle — completed ones pop to the
 * themed fill with a white checkmark, upcoming ones keep their gray number.
 * Re-runs smoothly whenever the admin changes the membership nights, and the
 * settled values always equal the real data (never an incorrect progress).
 */
function ArcGauge({ nights, theme }: { nights: number; theme: MembershipTheme }) {
  const reduce = useReducedMotion();
  const [arcF, setArcF] = useState(0);
  const [count, setCount] = useState(0);
  const arcRef = useRef(0);
  const countRef = useRef(0);

  const targetF = Math.min(Math.max(nights, 0), TARGET) / TARGET;
  const targetN = Math.max(nights, 0);

  useEffect(() => {
    if (reduce) {
      // Defer to a macrotask so the effect stays free of synchronous setState calls.
      const id = setTimeout(() => {
        arcRef.current = targetF;
        countRef.current = targetN;
        setArcF(targetF);
        setCount(targetN);
      }, 0);
      return () => clearTimeout(id);
    }
    const c1 = animate(arcRef.current, targetF, {
      duration: 1.35,
      ease: EASE_OUT,
      onUpdate: (v) => {
        arcRef.current = v;
        setArcF(v);
      },
    });
    const c2 = animate(countRef.current, targetN, {
      duration: 1.35,
      ease: EASE_OUT,
      onUpdate: (v) => {
        countRef.current = v;
        setCount(v);
      },
    });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [targetF, targetN, reduce]);

  const cx = 170;
  const cy = 178;
  const r = 148;

  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  const track = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  const nodeAt = (mile: number) => {
    const deg = 180 - (180 * mile) / TARGET;
    const p = pt(deg);
    return { deg, ...p };
  };

  return (
    <div className="relative mx-auto w-[340px] max-w-full">
      <svg viewBox="0 0 340 200" className="w-full" aria-hidden>
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.progressTo} />
            <stop offset="100%" stopColor={theme.progressFrom} />
          </linearGradient>
        </defs>
        {/* track */}
        <path d={track} fill="none" stroke="#403D3B" strokeWidth="7" strokeLinecap="round" />
        {/* progress — dasharray follows the animated value so the arc sweeps smoothly */}
        {arcF > 0.004 && (
          <path
            d={track}
            pathLength={1}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${arcF.toFixed(4)} 1`}
          />
        )}
        {/* Milestone nodes 10 / 25 / 50 / 75 / 100 at their exact positions —
            completed milestones turn the themed fill with a white checkmark,
            upcoming ones stay gray with their number. The 100 target keeps its
            slightly larger node size (existing layout, unchanged). */}
        {[0, ...MILESTONES].map((m) => {
          const p = nodeAt(m);
          const isTarget = m === TARGET;
          const reached = arcF >= m / TARGET - 0.002 && (m > 0 ? nights >= m : nights > 0);
          const r = isTarget ? 15.5 : 13;
          return (
            <g
              key={m}
              className="bv-node"
              style={{
                transform: reached ? "scale(1)" : "scale(0.7)",
                opacity: reached ? 1 : 0.85,
              }}
            >
              <circle cx={p.x} cy={p.y} r={r} fill={reached ? theme.progressReached : "#454240"} />
              {reached ? (
                <path
                  d={
                    isTarget
                      ? `M ${p.x - 6} ${p.y} l 4.2 4.2 l 7.8 -8.4`
                      : `M ${p.x - 5} ${p.y} l 3.5 3.5 l 6.5 -7`
                  }
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <text
                  x={p.x}
                  y={p.y + (isTarget ? 4 : 3.5)}
                  textAnchor="middle"
                  fontSize={isTarget ? 11.5 : 10.5}
                  fontWeight="700"
                  fill="#D6D3D0"
                >
                  {m}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-x-0 top-[74px] flex flex-col items-center">
        <span className="text-[62px] leading-[62px] font-bold text-white">{fmtInt(Math.round(count))}</span>
      </div>
      <Pressable className="absolute inset-x-0 top-[188px] flex items-center justify-center gap-1 text-[15px] font-medium text-white">
        Nights This Year <span className="text-white/80">›</span>
      </Pressable>
    </div>
  );
}

function PillButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Pressable
      onClick={onClick}
      className="flex-1 bg-[#343130] rounded-[12px] py-[18px] flex flex-col items-center gap-[10px]"
    >
      <span className="text-[var(--bv-accent)]">{icon}</span>
      <span className="text-[16px] font-medium text-white">{label}</span>
    </Pressable>
  );
}

function CountRow({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick?: () => void;
}) {
  return (
    <Pressable
      onClick={onClick}
      scale={0.98}
      className="w-full bg-[#343130] rounded-[12px] px-4 h-[62px] flex items-center gap-4"
    >
      <span className="text-white">{icon}</span>
      <span className="flex-1 text-left text-[18px] font-semibold text-white">{label}</span>
      <span className="w-[30px] h-[30px] rounded-full bg-[#454241] flex items-center justify-center text-[14px] font-bold text-white">
        {count}
      </span>
    </Pressable>
  );
}

/** Skeleton placeholders shown before the profile data arrives (requirement 19-C). */
function AccountSkeleton() {
  return (
    <div className="px-5 pt-6 flex flex-col gap-4" aria-hidden>
      <Skel className="h-[46px] w-[46px] rounded-[10px]" />
      <Skel className="h-[280px] w-full rounded-[26px]" />
      <Skel className="h-[46px] w-full rounded-[12px]" />
      <Skel className="h-[46px] w-[70%] rounded-[10px]" />
      <Skel className="h-[220px] w-full rounded-[26px]" />
    </div>
  );
}

export default function AccountScreen() {
  const { profile, profileLoading, profileError, refreshProfile, openSub, theme } = useApp();
  const { toast } = useToast();
  const [newWaysDismissed, setNewWaysDismissed] = useState(true);
  const clickTimes = useRef<number[]>([]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        setNewWaysDismissed(localStorage.getItem("bv_newways_dismissed") === "1");
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const dismissNewWays = () => {
    setNewWaysDismissed(true);
    try {
      localStorage.setItem("bv_newways_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  /**
   * Hidden admin entry — five consecutive clicks on the account name open the
   * Admin Login screen. The counter resets when the sequence is interrupted
   * (more than 2.5s between clicks).
   */
  const handleNameClick = () => {
    const now = Date.now();
    const recent = clickTimes.current.filter((t) => now - t < 2500);
    recent.push(now);
    clickTimes.current = recent;
    if (recent.length >= 5) {
      clickTimes.current = [];
      openSub("admin-login");
    }
  };

  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "…";
  const level = profile?.memberLevel ?? "Titanium Elite";
  const nights = profile?.nights ?? 0;
  const points = profile?.points ?? 0;
  const expiry = profile?.expiryDate ?? "";
  const spend = profile ? fmtSpend(profile.spend) : "";

  return (
    <div className="absolute inset-0 bg-[#232120]">
      {/* Fixed gradient header — themed by the active membership level.
          48px tall like the native app. The OS status bar above it is tinted
          with the same gradient tone via meta theme-color — no fake bar — and
          .bv-barfade melts the header's first pixels into that tone so bar and
          header read as one surface. In edge-to-edge mode (html.bv-e2e) the
          header grows by the real inset instead and the gradient itself shows
          through the transparent system bar. */}
      <div
        className="absolute top-0 inset-x-0 z-20 h-[calc(48px+env(safe-area-inset-top,0px))]"
        style={{ background: "var(--bv-header-gradient)" }}
      >
        <div aria-hidden className="bv-barfade" />
        <div className="absolute top-[calc(15px+env(safe-area-inset-top,0px))] inset-x-0 pl-8 pr-6 flex items-center justify-between">
          <Pressable
            onClick={handleNameClick}
            scale={0.94}
            className="text-[18px] leading-[22px] font-semibold text-white select-none"
            title={name}
          >
            {name}
          </Pressable>
          <Pressable
            aria-label="Open profile"
            scale={0.9}
            onClick={() => openSub("profile")}
            className="text-white p-1"
          >
            <UserRound size={22} strokeWidth={1.9} />
          </Pressable>
        </div>
      </div>

      {profileLoading ? (
        <AccountSkeleton />
      ) : profileError || !profile ? (
        <div className="px-6 pt-10 flex flex-col items-center gap-3 text-center" role="alert">
          <Info size={28} className="text-[#D7B56D]" />
          <p className="text-[17px] font-semibold text-white">Account details could not load</p>
          <p className="text-[13px] leading-relaxed text-[#A19E9B]">
            {profileError || "The account profile is not available."}
          </p>
          <Pressable
            onClick={() => void refreshProfile()}
            scale={0.96}
            className="mt-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white"
            style={{ background: "var(--bv-cta-gradient)" }}
          >
            Try Again
          </Pressable>
        </div>
      ) : (
        <FadeIn className="h-full overflow-y-auto no-scrollbar pt-[calc(48px+env(safe-area-inset-top,0px))]">
          {/* Membership dashboard */}
          <section className="bg-[#2E2C2B] rounded-t-[26px] px-5 pt-5 pb-6">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {/* ORIGINAL membership badge artwork — fixed asset, the same
                    original mark as the profile page; never redrawn or
                    recoloured. */}
                <img
                  src="/img/profile-badge-original.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-[44px] w-[44px] select-none"
                  draggable={false}
                />
              </div>
              <div>
                <button className="text-[13px] text-white/80 flex items-center gap-1">
                  Your Level <span>›</span>
                </button>
                <p className="text-[24px] font-bold text-white leading-tight">{level}</p>
              </div>
            </div>

            <div className="mt-6">
              <ArcGauge nights={nights} theme={theme} />
            </div>

            <div className="mt-[52px] bg-[#33302F] rounded-[12px] h-[46px] px-4 flex items-center justify-between">
              <span className="text-[15px] text-white flex items-center gap-2">
                Annual Qualifying Spend <Info size={14} className="opacity-70" />
              </span>
              <span className="text-[15px] font-bold text-white">{spend}</span>
            </div>

            <Pressable
              onClick={() => toast({ title: "Account Activity", description: "Recent activity is available in this demo via the admin dashboard." })}
              scale={0.98}
              className="mt-4 w-full h-[46px] rounded-[10px] border border-[#4A4745] flex items-center justify-center gap-2 text-[15px] font-semibold text-white"
            >
              View Account Activity <span className="text-white/80">›</span>
            </Pressable>
          </section>

          <div className="h-[6px]" />

          {/* Points Balance */}
          <section className="bg-[#2E2C2B] px-5 pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-white">Points Balance</h2>
                <p className="mt-1 text-[13px] text-[#A19E9B] flex items-center gap-1">
                  Expires {expiry} <Info size={13} className="opacity-70" />
                </p>
              </div>
              <CountUp
                value={points}
                className="text-[38px] font-bold text-white leading-[40px]"
              />
            </div>

            <div className="mt-4 h-[54px] rounded-[8px] bg-[#3A3836]" />

            <div className="mt-4 flex gap-3">
              <PillButton
                label="Earn"
                onClick={() => toast({ title: "Earn Points", description: "Earn points on stays, dining and more." })}
                icon={
                  <span className="relative inline-flex">
                    <Star size={24} className="text-[var(--bv-accent)]" />
                    <span className="absolute -top-[3px] -right-[5px] text-[12px] leading-none font-bold">+</span>
                  </span>
                }
              />
              <PillButton
                label="Redeem"
                onClick={() => toast({ title: "Redeem Points", description: "Use points for free nights and rewards." })}
                icon={<Gift size={24} />}
              />
              <PillButton
                label="More"
                onClick={() => toast({ title: "More Options", description: "Explore more ways to use points." })}
                icon={<MoreHorizontal size={24} />}
              />
            </div>

            {!newWaysDismissed && (
              <FadeIn className="mt-4 bg-[#F1EFED] rounded-[14px] px-5 py-4 relative">
                <Pressable
                  aria-label="Dismiss"
                  onClick={dismissNewWays}
                  scale={0.88}
                  className="absolute top-3 right-3 text-[#1B1918]"
                >
                  <X size={20} />
                </Pressable>
                <p className="text-[17px] font-bold text-[#1B1918] pr-8">New Ways to Earn and Redeem!</p>
                <p className="mt-1 text-[14px] text-[#4A4745] leading-relaxed">
                  Discover how easy it is to earn points and use them for exciting rewards.
                </p>
              </FadeIn>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <CountRow
                icon={<Award size={22} strokeWidth={1.9} />}
                label="Awards"
                count={0}
                onClick={() => toast({ title: "Awards", description: "Unlock free nights and more." })}
              />
              <CountRow
                icon={<Gift size={22} strokeWidth={1.9} />}
                label="Gift Cards"
                count={0}
                onClick={() => toast({ title: "Gift Cards", description: "Shop & manage gift cards." })}
              />
              <Pressable
                onClick={() => openSub("wallet")}
                scale={0.98}
                className="w-full h-[46px] rounded-[10px] border border-[#4A4745] flex items-center justify-center gap-2 text-[15px] font-semibold text-white"
              >
                View Wallet <span className="text-white/80">›</span>
              </Pressable>
            </div>
          </section>

          <div className="h-[6px]" />

          {/* Promotions & Offers */}
          <section className="bg-[#2E2C2B] px-5 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[23px] font-bold text-white">Promotions &amp; Offers</h2>
              <Pressable
                onClick={() => toast({ title: "Promotions & Offers", description: "All current offers are shown here." })}
                scale={0.95}
                className="text-[14px] font-medium text-white flex items-center gap-1"
              >
                View More <ArrowRight size={15} />
              </Pressable>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              <TapCard className="shrink-0 relative w-[340px] h-[184px] rounded-[12px] overflow-hidden">
                <img
                  src="/img/swiggy-food.jpg"
                  alt="Points for Every Order"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[20px] font-bold text-white">Points for Every Order</p>
                  <p className="text-[14px] text-white/90 mt-[2px]">Earn Points on every Swiggy order</p>
                </div>
              </TapCard>
              <TapCard className="shrink-0 relative w-[340px] h-[184px] rounded-[12px] overflow-hidden">
                <img
                  src="/img/biryani.jpg"
                  alt="Festive Feasts"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[20px] font-bold text-white">Festive Feasts</p>
                  <p className="text-[14px] text-white/90 mt-[2px]">Limited-time dining offers</p>
                </div>
              </TapCard>
            </div>
          </section>

          <div className="h-[6px]" />

          {/* Member Benefits */}
          <section className="bg-[#2E2C2B] px-5 pt-6 pb-[104px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[23px] font-bold text-white">Member Benefits</h2>
              <Pressable
                onClick={() => toast({ title: "Member Benefits", description: "All membership benefits are shown here." })}
                scale={0.95}
                className="text-[14px] font-medium text-white flex items-center gap-1"
              >
                View More <ArrowRight size={15} />
              </Pressable>
            </div>
            <div className="mt-6 flex gap-4">
              {[
                { icon: <Wifi size={26} />, label: "Complimentary Wi-Fi" },
                { icon: <BadgePercent size={26} />, label: "Exclusive Member Rates" },
                { icon: <KeyRound size={26} />, label: "Mobile Check-in & Mobile Key" },
              ].map((b) => (
                <Pressable
                  key={b.label}
                  onClick={() => toast({ title: b.label, description: "Included with your membership." })}
                  scale={0.94}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <span className="w-[92px] h-[92px] rounded-full bg-[#343130] flex items-center justify-center text-[var(--bv-accent)]">
                    {b.icon}
                  </span>
                  <span className="text-[13px] text-white text-center leading-snug">{b.label}</span>
                </Pressable>
              ))}
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
