"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "@/components/bonvoy/store";
import { BvMotionConfig, ScreenTransition } from "@/components/bonvoy/motion";
import Splash from "@/components/bonvoy/Splash";
import BottomNav from "@/components/bonvoy/BottomNav";
import HomeScreen from "@/components/bonvoy/screens/HomeScreen";
import BookScreen from "@/components/bonvoy/screens/BookScreen";
import TripsScreen from "@/components/bonvoy/screens/TripsScreen";
import WishlistsScreen from "@/components/bonvoy/screens/WishlistsScreen";
import AccountScreen from "@/components/bonvoy/screens/AccountScreen";
import ProfileOverlay from "@/components/bonvoy/screens/ProfileOverlay";
import WalletScreen from "@/components/bonvoy/screens/WalletScreen";
import AdminLoginScreen from "@/components/bonvoy/screens/AdminLoginScreen";
import AdminDashboardScreen from "@/components/bonvoy/screens/AdminDashboardScreen";
import {
  PersonalInfoScreen,
  PreferencesScreen,
  PaymentMethodsScreen,
  SecurityScreen,
  MemberSupportScreen,
  PrivacyScreen,
} from "@/components/bonvoy/screens/SubPages";

function Screens() {
  const { tab, sub } = useApp();

  return (
    <>
      {/* Base tab screens — horizontal fade + slide between tabs */}
      <AnimatePresence initial={false}>
        {tab === "home" && (
          <ScreenTransition key="tab-home" screenKey="tab-home" kind="tab">
            <HomeScreen />
          </ScreenTransition>
        )}
        {tab === "book" && (
          <ScreenTransition key="tab-book" screenKey="tab-book" kind="tab">
            <BookScreen />
          </ScreenTransition>
        )}
        {tab === "trips" && (
          <ScreenTransition key="tab-trips" screenKey="tab-trips" kind="tab">
            <TripsScreen />
          </ScreenTransition>
        )}
        {tab === "wishlists" && (
          <ScreenTransition key="tab-wishlists" screenKey="tab-wishlists" kind="tab">
            <WishlistsScreen />
          </ScreenTransition>
        )}
        {tab === "account" && (
          <ScreenTransition key="tab-account" screenKey="tab-account" kind="tab">
            <AccountScreen />
          </ScreenTransition>
        )}
      </AnimatePresence>

      {/* Full-screen overlays — slide up on open, slide/fade away on back */}
      <AnimatePresence initial={false}>
        {sub === "profile" && (
          <ScreenTransition key="sub-profile" screenKey="sub-profile" kind="profile">
            <ProfileOverlay />
          </ScreenTransition>
        )}
        {sub === "personal-info" && (
          <ScreenTransition key="sub-personal-info" screenKey="sub-personal-info" kind="sub">
            <PersonalInfoScreen />
          </ScreenTransition>
        )}
        {sub === "preferences" && (
          <ScreenTransition key="sub-preferences" screenKey="sub-preferences" kind="sub">
            <PreferencesScreen />
          </ScreenTransition>
        )}
        {sub === "payment-methods" && (
          <ScreenTransition key="sub-payment-methods" screenKey="sub-payment-methods" kind="sub">
            <PaymentMethodsScreen />
          </ScreenTransition>
        )}
        {sub === "security-page" && (
          <ScreenTransition key="sub-security-page" screenKey="sub-security-page" kind="sub">
            <SecurityScreen />
          </ScreenTransition>
        )}
        {sub === "member-support" && (
          <ScreenTransition key="sub-member-support" screenKey="sub-member-support" kind="sub">
            <MemberSupportScreen />
          </ScreenTransition>
        )}
        {sub === "privacy" && (
          <ScreenTransition key="sub-privacy" screenKey="sub-privacy" kind="sub">
            <PrivacyScreen />
          </ScreenTransition>
        )}
        {sub === "wallet" && (
          <ScreenTransition key="sub-wallet" screenKey="sub-wallet" kind="sub">
            <WalletScreen />
          </ScreenTransition>
        )}
        {sub === "admin-login" && (
          <ScreenTransition key="sub-admin-login" screenKey="sub-admin-login" kind="sub">
            <AdminLoginScreen />
          </ScreenTransition>
        )}
        {sub === "admin-dashboard" && (
          <ScreenTransition key="sub-admin-dashboard" screenKey="sub-admin-dashboard" kind="sub">
            <AdminDashboardScreen />
          </ScreenTransition>
        )}
      </AnimatePresence>

      {/* Bottom navigation — permanently fixed to the bottom edge (safe-area
          aware). It never slides, shifts, or gets cut off on any screen size. */}
      {(sub === null || sub === "profile") && (
        <div className="absolute bottom-0 inset-x-0 z-40">
          <BottomNav />
        </div>
      )}
    </>
  );
}

export default function Page() {
  // App launch animation (requirement 19-A): splash overlays the app, then
  // cross-fades into Home. onDone is stable so Splash's timer never re-runs.
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  return (
    <BvMotionConfig reducedMotion="user">
      <AppProvider>
        <div className="min-h-dvh w-full bg-[#141312] flex items-center justify-center sm:py-4">
          {/* Full-bleed on phones (max-width cap only on ≥sm screens) so the app
              fills the device edge-to-edge exactly like the native app. */}
          <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[min(100dvh,900px)] sm:rounded-[42px] overflow-hidden bg-[#2B2928] text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:outline sm:outline-[10px] sm:outline-black/70">
            <Screens />
            <AnimatePresence>
              {!splashDone && <Splash key="splash" onDone={finishSplash} />}
            </AnimatePresence>
          </div>
        </div>
      </AppProvider>
    </BvMotionConfig>
  );
}
