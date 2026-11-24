"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Ellipsis, QrCode, CreditCard, Award, Gift, CalendarDays, X, Loader2 } from "lucide-react";
import { useApp } from "@/components/bonvoy/store";
import { MarriottLogo } from "@/components/bonvoy/primitives";
import { fmtInt, levelTier, fullName } from "@/lib/bonvoy/types";
import { useToast } from "@/hooks/use-toast";
import { EASE_OUT, Pressable } from "@/components/bonvoy/motion";

/**
 * Membership card + buttons — themed by the active membership level through
 * the global CSS variables (--bv-card-gradient / --bv-button-gradient /
 * --bv-cta-gradient / --bv-scan-icon / --bv-loader). Titanium Elite keeps the
 * original burgundy values (see globals.css defaults).
 */

function ScanSheet() {
  const { setScanOpen } = useApp();
  const { toast } = useToast();
  const [png, setPng] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/qr/image", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!alive) return;
        if (r.ok && d.png) setPng(d.png);
        else setError(d.error || "No QR available yet.");
      })
      .catch(() => alive && setError("Could not load the QR code."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50">
      {/* Backdrop fades in/out */}
      <motion.div
        className="absolute inset-0 bg-black/45"
        onClick={() => setScanOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
      />
      {/* Sheet slides up + fades in, slides back down on close */}
      <motion.div
        className="absolute bottom-0 inset-x-0 bg-[#2E2C2B] rounded-t-[26px] pb-7"
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "100%", opacity: 0.6 }}
        transition={{ duration: 0.36, ease: EASE_OUT }}
      >
        <div className="pt-[14px] flex justify-center">
          <div className="w-[58px] h-[5px] rounded-full bg-[#6B6866]" />
        </div>

        <div className="px-5 pt-3 pb-4 flex items-center gap-4">
          <Pressable aria-label="Close" scale={0.9} onClick={() => setScanOpen(false)} className="text-white p-1 -ml-1">
            <X size={24} strokeWidth={2.2} />
          </Pressable>
          <h2 className="text-[19px] font-bold text-white">Scan to Earn or Redeem Points</h2>
        </div>

        <div className="mx-auto w-[234px] h-[234px] rounded-[18px] bg-[#3B3837] border border-[#4A4745] flex items-center justify-center">
          {error ? (
            <p className="px-4 text-[13px] text-[#A19E9B] text-center">{error}</p>
          ) : png ? (
            <motion.div
              className="bg-white p-[8px] rounded-[6px]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <img src={png} alt="Member QR code" className="w-[196px] h-[196px] block" />
            </motion.div>
          ) : (
            <Loader2 size={30} className="text-[var(--bv-loader)] animate-spin" />
          )}
        </div>

        <div className="px-6 pt-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <QrCode size={24} className="text-white mt-[2px]" strokeWidth={1.9} />
            <div>
              <p className="text-[17px] font-bold text-white">Scan Your Code</p>
              <p className="text-[14px] text-[#A19E9B] mt-[2px]">Show hotel staff your Member QR code</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <CalendarDays size={24} className="text-white mt-[2px]" strokeWidth={1.9} />
            <div>
              <p className="text-[17px] font-bold text-white">Points Activity</p>
              <p className="text-[14px] text-[#A19E9B] mt-[2px]">
                Earned points post to your account in 2–3 business days
              </p>
            </div>
          </div>
        </div>

        <div className="mx-6 mt-6 border-t border-[#3F3C3B] pt-5">
          <p className="text-[13px] text-[#A19E9B] text-center leading-relaxed px-4">
            Earn and redeem points available only at participating hotels and restaurants.
          </p>
          <div className="mt-4 flex items-center justify-center gap-8">
            <Pressable
              onClick={() => toast({ title: "View FAQs", description: "FAQ viewer is disabled in this demo." })}
              scale={0.95}
              className="text-[15px] font-medium text-white underline underline-offset-4"
            >
              View FAQs
            </Pressable>
            <Pressable
              onClick={() => toast({ title: "Program Details", description: "Program viewer is disabled in this demo." })}
              scale={0.95}
              className="text-[15px] font-medium text-white underline underline-offset-4"
            >
              Program Details
            </Pressable>
          </div>
        </div>

        <Pressable
          onClick={() => setScanOpen(false)}
          scale={0.97}
          className="mx-5 mt-6 w-[calc(100%-40px)] h-[54px] rounded-full text-[18px] font-semibold text-white"
          style={{ background: "var(--bv-button-gradient)" }}
        >
          Done
        </Pressable>
      </motion.div>
    </div>
  );
}

function WalletRow({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <Pressable onClick={onClick} scale={0.98} className="w-full py-[18px] flex items-center gap-4 text-left">
      <span className="text-white">{icon}</span>
      <span className="flex-1">
        <span className="block text-[18px] font-semibold text-white">{title}</span>
        <span className="block text-[14px] text-[#A19E9B] mt-[2px]">{sub}</span>
      </span>
      <span className="text-white/85 text-[20px]">›</span>
    </Pressable>
  );
}

export default function WalletScreen() {
  const { profile, back, scanOpen, setScanOpen } = useApp();
  const { toast } = useToast();

  const points = profile ? fmtInt(profile.points) : "";
  const number = profile?.memberNumber ?? "";
  const name = fullName(profile);
  const tier = levelTier(profile?.memberLevel ?? "");

  return (
    <div className="absolute inset-0 z-30 bg-[#2E2C2B]">
      <div className="h-full overflow-y-auto no-scrollbar pt-[calc(20px+env(safe-area-inset-top,0px))] pb-10">
        <div className="px-5 pt-2 flex items-center justify-between">
          <Pressable aria-label="Back" scale={0.9} onClick={back} className="text-white p-1 -ml-1">
            <ArrowLeft size={24} strokeWidth={2.1} />
          </Pressable>
          <Pressable
            aria-label="More options"
            scale={0.9}
            onClick={() => toast({ title: "More Options", description: "Wallet settings are disabled in this demo." })}
            className="text-white p-1"
          >
            <Ellipsis size={24} strokeWidth={2.1} />
          </Pressable>
        </div>

        <h1 className="px-5 mt-3 text-[26px] font-bold text-white">Wallet</h1>

        {/* Membership card — themed by the active membership level */}
        <div className="mx-5 mt-5 h-[212px] rounded-[16px] relative overflow-hidden" style={{ background: "var(--bv-card-gradient)" }}>
          <div className="absolute top-5 left-5">
            <MarriottLogo scale={0.72} />
          </div>
          <div className="absolute top-5 right-6 text-right">
            <p className="text-[26px] font-bold text-white leading-[28px]">{points}</p>
            <p className="text-[13px] text-white/95">Points Balance</p>
          </div>
          <div className="absolute bottom-5 left-5">
            <p className="text-[19px] font-bold text-white">{number}</p>
            <p className="text-[14px] text-white/95 mt-[2px]">{name}</p>
          </div>
          <div className="absolute bottom-5 right-6">
            <p className="text-[14px] text-white/95">{tier}</p>
          </div>
        </div>

        {/* Scan Code */}
        <Pressable
          onClick={() => setScanOpen(true)}
          scale={0.98}
          className="mx-5 mt-4 w-[calc(100%-40px)] h-[62px] bg-[#3A3736] rounded-[12px] px-4 flex items-center gap-4"
        >
          <QrCode size={26} className="text-[var(--bv-scan-icon)]" strokeWidth={2} />
          <span className="text-[18px] font-semibold text-white">Scan Code</span>
        </Pressable>

        <div className="mt-6 h-[10px] bg-[#242221]" />

        <div className="px-5">
          <WalletRow
            icon={<CreditCard size={24} strokeWidth={1.9} />}
            title="Payment Methods"
            sub="0 Saved Cards"
            onClick={() => toast({ title: "Payment Methods", description: "Card management is disabled in this demo." })}
          />
          <div className="border-t border-[#3A3836]" />
          <WalletRow
            icon={<Award size={24} strokeWidth={1.9} />}
            title="Awards"
            sub="Unlock free nights and more"
            onClick={() => toast({ title: "Awards", description: "Unlock free nights and more." })}
          />
          <div className="border-t border-[#3A3836]" />
          <WalletRow
            icon={<Gift size={24} strokeWidth={1.9} />}
            title="Gift Cards"
            sub="Shop & manage gift cards"
            onClick={() => toast({ title: "Gift Cards", description: "Shop & manage gift cards." })}
          />
        </div>
      </div>

      {/* QR popup: slide-up + fade-in, reversed on close (requirement 19-F) */}
      <AnimatePresence>{scanOpen && <ScanSheet key="scan-sheet" />}</AnimatePresence>
    </div>
  );
}
