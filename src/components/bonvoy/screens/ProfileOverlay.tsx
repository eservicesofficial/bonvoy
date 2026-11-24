"use client";

import {
  X,
  UserRound,
  Wallet,
  Heart,
  Infinity as InfinityIcon,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { useToast } from "@/hooks/use-toast";
import { Pressable, Stagger, StaggerItem } from "@/components/bonvoy/motion";

function Row({
  icon,
  label,
  onClick,
  last,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onClick={onClick}
      scale={0.98}
      className={`w-full flex items-center gap-4 py-[17px] text-left ${last ? "" : "border-b border-[#3A3836]"}`}
    >
      {icon && <span className="text-white w-[26px] flex justify-center">{icon}</span>}
      <span className="flex-1 text-[18px] font-medium text-white">{label}</span>
      <ChevronRight size={19} className="text-white/85" />
    </Pressable>
  );
}

export default function ProfileOverlay() {
  const { profile, openSub, back } = useApp();
  const { toast } = useToast();

  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const level = profile?.memberLevel ?? "";
  const since = profile?.memberSince ?? "";
  const number = profile?.memberNumber ?? "";
  const lifetimeNights = profile?.lifetimeNights ?? 0;

  const simple = (title: string, desc: string) => () =>
    toast({ title, description: desc });

  return (
    <div className="absolute inset-0 z-30 overflow-hidden" style={{ background: "var(--bv-header-gradient)" }}>
      {/* Melt the gradient's top edge into the real OS status bar tone (see
          globals.css .bv-barfade). No fake bar: the OS bar itself is tinted;
          in edge-to-edge mode this fade is disabled automatically. */}
      <div aria-hidden className="bv-barfade" />
      <div className="h-full overflow-y-auto no-scrollbar">
        <Stagger className="px-5 pt-[calc(20px+env(safe-area-inset-top,0px))] flex justify-end" delay={0.22}>
          <StaggerItem>
            <Pressable aria-label="Close profile" onClick={back} scale={0.88} className="text-white p-1">
              <X size={26} strokeWidth={2.2} />
            </Pressable>
          </StaggerItem>
        </Stagger>

        {/* Header animates into view after the sheet lands */}
        <Stagger className="mt-2 flex flex-col items-center px-5" delay={0.26} step={0.07}>
          <StaggerItem>
            {/* ORIGINAL membership badge artwork (very important — user-supplied,
                extracted verbatim from the reference icon: white scalloped seal
                with the award-medal glyph). Rendered as-is — never recoloured
                or redrawn. */}
            <img
              src="/img/profile-badge-original.png"
              alt=""
              width={44}
              height={44}
              className="h-[44px] w-[44px] select-none"
              draggable={false}
            />
          </StaggerItem>
          <StaggerItem>
            <p className="mt-3 text-[27px] font-bold text-white">{name}</p>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-1 text-[15px] text-white/95">
              {level} Since {since}
            </p>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-[2px] text-[15px] text-white/95">#{number}</p>
          </StaggerItem>
        </Stagger>

        {/* Lifetime Progress — sits in the themed header, directly above the
            MY PROFILE heading. Translucent dark overlay per theme. */}
        <Stagger className="mt-7 px-5" delay={0.34}>
          <StaggerItem>
            <Pressable
              onClick={simple("Lifetime Progress", `You have ${lifetimeNights} lifetime nights with Marriott Bonvoy.`)}
              scale={0.98}
              className="w-full bg-[var(--bv-lifetime-pill)] rounded-[14px] h-[52px] px-4 flex items-center justify-between"
            >
              <span className="flex items-center gap-3 text-[15px] font-medium text-white">
                <InfinityIcon size={22} strokeWidth={1.9} /> Lifetime Progress
              </span>
              <span className="text-[15px] font-semibold text-white flex items-center gap-1">
                {lifetimeNights} Nights <ChevronRight size={16} className="text-white/85" />
              </span>
            </Pressable>
          </StaggerItem>
        </Stagger>

        {/* Menu sheet — fills down to the screen bottom on every device size */}
        <Stagger
          className="mt-5 bg-[#2E2C2B] rounded-t-[26px] px-5 pt-5 min-h-[calc(100dvh-300px)] sm:min-h-[calc(min(100dvh,900px)-300px)]"
          delay={0.42}
          step={0.05}
        >
          <StaggerItem>
            <p className="text-[12px] font-medium tracking-[0.22em] text-[#8F8C89] uppercase">
              My Profile
            </p>
          </StaggerItem>
          <div className="mt-1">
            <StaggerItem>
              <Row
                icon={<UserRound size={22} strokeWidth={1.9} />}
                label="Personal Information"
                onClick={() => openSub("personal-info")}
              />
            </StaggerItem>
            <StaggerItem>
              <Row
                icon={<Wallet size={22} strokeWidth={1.9} />}
                label="Wallet"
                onClick={() => openSub("wallet")}
              />
            </StaggerItem>
            <StaggerItem>
              <Row
                icon={<Heart size={22} strokeWidth={1.9} />}
                label="Preferences"
                onClick={() => openSub("preferences")}
                last
              />
            </StaggerItem>
          </div>

          <StaggerItem>
            <p className="mt-6 text-[12px] font-medium tracking-[0.22em] text-[#8F8C89] uppercase">
              Settings
            </p>
          </StaggerItem>
          <div className="mt-1">
            <StaggerItem>
              <Row label="Payment Methods" onClick={() => openSub("payment-methods")} />
            </StaggerItem>
            <StaggerItem>
              <Row label="Security" onClick={() => openSub("security-page")} />
            </StaggerItem>
            <StaggerItem>
              <Row label="Member Support" onClick={() => openSub("member-support")} />
            </StaggerItem>
            <StaggerItem>
              <Row label="Privacy & Account Management" onClick={() => openSub("privacy")} />
            </StaggerItem>
            <StaggerItem>
              <Row
                label="Sign Out"
                onClick={() =>
                  toast({ title: "Sign Out", description: "You have been signed out of this demo session." })
                }
                last
              />
            </StaggerItem>
          </div>
          {/* Spacer sized to the fixed bottom nav (+ safe area / Android gesture
              bar) so every menu row stays fully reachable above it. */}
          <div aria-hidden className="h-[calc(88px+env(safe-area-inset-bottom,0px))]" />
        </Stagger>
      </div>
    </div>
  );
}
