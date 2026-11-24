"use client";

import { Lock, Trophy, ChevronRight, MapPin, Search } from "lucide-react";
import type { ReactNode } from "react";
import { TapCard } from "@/components/bonvoy/motion";

/** Uppercase letter-spaced section label (e.g. "RECENTLY VIEWED"). */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`text-[12px] font-medium tracking-[0.22em] text-[#8F8C89] uppercase px-5 ${className}`}
    >
      {children}
    </h2>
  );
}

/** Horizontal scroller without visible scrollbar. */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-3 overflow-x-auto no-scrollbar px-5 ${className}`}>{children}</div>
  );
}

/** Dark row card with square image on the left and hotel name on the right. */
export function HotelRowCard({
  img,
  name,
  imgPosition,
}: {
  img: string;
  name: string;
  imgPosition?: string;
}) {
  return (
    <TapCard className="shrink-0 w-[348px] h-[110px] bg-[#3C3937] rounded-[14px] overflow-hidden flex shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      <img
        src={img}
        alt={name}
        className="w-[116px] h-full object-cover shrink-0"
        style={imgPosition ? { objectPosition: imgPosition } : undefined}
      />
      <div className="flex-1 flex items-center px-[14px]">
        <span className="text-[15px] font-semibold text-white leading-snug whitespace-nowrap overflow-hidden">
          {name}
        </span>
      </div>
    </TapCard>
  );
}

/** Big image card with a badge (top-left) and bold overlay title (bottom). */
export function OverlayCard({
  img,
  title,
  subtitle,
  badge,
  badgeIcon,
  className = "",
  imgPosition,
}: {
  img: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeIcon?: "lock" | "trophy";
  className?: string;
  imgPosition?: string;
}) {
  return (
    <TapCard
      className={`shrink-0 relative rounded-[14px] overflow-hidden bg-[#3C3937] shadow-[0_2px_10px_rgba(0,0,0,0.35)] ${className}`}
    >
      { }
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        style={imgPosition ? { objectPosition: imgPosition } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5" />
      {badge && (
        <div className="absolute top-3 left-3 flex items-center gap-[6px] bg-[#151312]/85 rounded-lg px-[10px] py-[7px]">
          {badgeIcon === "trophy" ? (
            <Trophy size={13} className="text-white" />
          ) : (
            <Lock size={13} className="text-white" />
          )}
          <span className="text-[12px] font-semibold text-white">{badge}</span>
        </div>
      )}
      <div className="absolute bottom-3 left-4 right-4">
        <p className="text-[19px] font-bold text-white leading-snug drop-shadow-md">{title}</p>
        {subtitle && <p className="text-[14px] text-white/90 mt-[4px]">{subtitle}</p>}
      </div>
    </TapCard>
  );
}

/** Wide image card with title + subtitle (Dine and Earn / Explore More). */
export function WideCard({
  img,
  title,
  subtitle,
  imgPosition,
}: {
  img: string;
  title: string;
  subtitle: string;
  imgPosition?: string;
}) {
  return (
    <TapCard className="shrink-0 relative w-[346px] h-[190px] rounded-[14px] overflow-hidden bg-[#3C3937] shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      { }
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        style={imgPosition ? { objectPosition: imgPosition } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-[20px] font-bold text-white leading-tight">{title}</p>
        <p className="text-[14px] text-white/90 mt-1">{subtitle}</p>
      </div>
    </TapCard>
  );
}

/** Tall destination card ("Explore Now"). */
export function DestinationCard({
  img,
  name,
  imgPosition,
}: {
  img: string;
  name: string;
  imgPosition?: string;
}) {
  return (
    <TapCard className="shrink-0 relative w-[188px] h-[318px] rounded-[14px] overflow-hidden bg-[#3C3937] shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
      { }
      <img
        src={img}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        style={imgPosition ? { objectPosition: imgPosition } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
      <div className="absolute bottom-4 left-4 right-3">
        <p className="text-[22px] font-bold text-white leading-tight">{name}</p>
        <p className="text-[14px] text-white/90 mt-[6px]">Explore Now</p>
      </div>
    </TapCard>
  );
}

/** Marriott Bonvoy wordmark (stacked). */
export function MarriottLogo({ scale = 1 }: { scale?: number }) {
  return (
    <div className="flex flex-col items-center select-none" style={{ transform: `scale(${scale})` }}>
      <span className="text-white text-[10px] font-semibold leading-[13px] tracking-[0.42em] ml-[0.42em]">
        MARRIOTT
      </span>
      <span className="relative text-white text-[20px] font-bold leading-[23px] tracking-[0.18em]">
        BONVOY
        {/* Brand orange dash under the second O — part of the BONVOY wordmark */}
        <span
          aria-hidden
          className="absolute h-[3px] w-[13px] rounded-full bg-[#FF9662]"
          style={{ left: "75%", bottom: "-2px", transform: "translateX(-50%)" }}
        />
      </span>
    </div>
  );
}

/** Rosette / medal badge used for membership level markers.
 *  `stroke` = inner cut-out colour; defaults to the Titanium burgundy, themed
 *  usages pass the active theme's value (badgeBg / rosetteStroke). */
export function Rosette({
  size = 22,
  className = "",
  stroke = "var(--bv-rosette-stroke, #5C2740)",
}: {
  size?: number;
  className?: string;
  stroke?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 1.5l2.1 1.6 2.6-.3 1 2.4 2.4 1-.3 2.6L21.4 12l-1.6 2.1.3 2.6-2.4 1-1 2.4-2.6-.3L12 21.4l-2.1-1.6-2.6.3-1-2.4-2.4-1 .3-2.6L2.6 12l1.6-2.1-.3-2.6 2.4-1 1-2.4 2.6.3L12 1.5z"
        fill="currentColor"
        opacity="0.95"
      />
      <circle cx="12" cy="10" r="3.1" stroke={stroke} strokeWidth="1.6" fill="none" />
      <path d="M10.2 12.6L9 16.4l3-1.6 3 1.6-1.2-3.8" stroke={stroke} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

/** Search pill reused on Home / Book — placeholder centered like the native app. */
export function SearchPill({ onStuckBg }: { onStuckBg?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 h-[56px] rounded-full px-[14px] ${
        onStuckBg ? "bg-[#33302F]" : "bg-[#2E2B2A]/95"
      } border border-[#4A4745]/50 shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}
    >
      <Search size={20} className="text-white shrink-0" strokeWidth={2.4} />
      <span className="flex-1 text-center text-[17px] text-[#B3B0AD] font-normal">
        Where can we take you?
      </span>
    </div>
  );
}

/** Location chip over the hero image (position matches the native app). */
export function LocationChip({ label }: { label: string }) {
  return (
    <div className="absolute bottom-[32px] right-[36px] flex items-center gap-[7px] bg-[#151312]/80 rounded-[10px] px-[12px] py-[9px]">
      <MapPin size={14} className="text-white" />
      <span className="text-[13px] font-medium text-white">{label}</span>
    </div>
  );
}

/** Bold chevron matching the native greeting-bar affordance. */
export function Chevron({ size = 18 }: { size?: number }) {
  return <ChevronRight size={size} strokeWidth={2.8} className="text-white shrink-0" />;
}
