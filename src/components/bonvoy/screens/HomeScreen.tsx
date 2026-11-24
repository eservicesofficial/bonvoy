"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/bonvoy/store";
import {
  SectionLabel,
  HScroll,
  HotelRowCard,
  OverlayCard,
  DestinationCard,
  WideCard,
  MarriottLogo,
  SearchPill,
  LocationChip,
  Chevron,
} from "@/components/bonvoy/primitives";
import { firstNameOnly, fmtInt } from "@/lib/bonvoy/types";
import { Pressable, Skel } from "@/components/bonvoy/motion";

export default function HomeScreen() {
  const { profile } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const onScroll = () => {
    const st = scrollRef.current?.scrollTop ?? 0;
    setStuck(st > 44);
  };

  const firstName = firstNameOnly(profile);
  const nights = profile?.lifetimeNights ?? 3;
  const points = profile ? fmtInt(profile.points) : "2,212";

  return (
    <div className="absolute inset-0 bg-[#2B2928]">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto no-scrollbar">
        {/* Sticky header: logo (collapses on scroll) + search pill.
            Spacing matches the native app: compact logo block, pill top ≈50px.
            -mb-[120px] = exact header stack height, so the hero starts at y=0
            and the greeting bar lands at ~63% of the screen (native parity). */}
        <div className="sticky top-0 z-30 -mb-[calc(120px+env(safe-area-inset-top,0px))]">
          <div
            className={`pt-[calc(2px+env(safe-area-inset-top,0px))] transition-colors duration-200 ${stuck ? "bg-[#3A3736]" : "bg-transparent"}`}
          >
            <div
              className={`overflow-hidden transition-all duration-300 ${
                stuck ? "h-0 opacity-0" : "h-[38px] opacity-100"
              }`}
            >
              <div className="flex justify-center">
                <MarriottLogo />
              </div>
            </div>
            <div className="px-[38px] pt-[10px] pb-[14px]">
              <SearchPill onStuckBg={stuck} />
            </div>
          </div>
        </div>

        {/* Hero — full native-app height (banner lands at ~63% of the screen,
            same as the reference); no dark overlay at the top so the OS status
            bar tone blends with the sky. */}
        <div className="relative h-[575px]">
          <img
            src="/img/hero-delhi.jpg"
            alt="New Delhi"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <LocationChip label="New Delhi - NCR, India" />
        </div>

        {/* Greeting bar — themed by the active membership level; skeleton pills while the profile loads (requirement 19-C).
            Geometry matches the native app: 48px strip, 32/40px insets, 15px bold type. */}
        <Pressable
          scale={0.99}
          className="w-full h-[48px] pl-8 pr-10 flex items-center justify-between text-left"
          style={{ background: "var(--bv-greeter-gradient)" }}
        >
          {profile === null ? (
            <span className="w-full flex items-center justify-between" aria-hidden>
              <Skel className="h-[16px] w-[110px] rounded-[6px] !bg-white/15" />
              <Skel className="h-[16px] w-[150px] rounded-[6px] !bg-white/15" />
            </span>
          ) : (
            <>
              <span className="text-[15px] font-bold text-white">Hello, {firstName || "Guest"}</span>
              <span className="flex items-center gap-[7px] text-[15px] font-bold text-white">
                {nights} Nights <span className="font-bold">•</span> {points} Pts <Chevron size={20} />
              </span>
            </>
          )}
        </Pressable>

        {/* Recently Viewed */}
        <section className="pt-7">
          <SectionLabel>Recently Viewed</SectionLabel>
          <HScroll className="mt-4">
            <HotelRowCard img="/img/westin-kolkata.jpg" name="The Westin Kolkata Rajarhat" />
            <HotelRowCard img="/img/fairfield-room.jpg" name="Fairfield by Marriott Kolkata" />
            <HotelRowCard img="/img/fern-lobby.jpg" name="The Fern Residency Bengaluru" />
          </HScroll>
        </section>

        {/* Recommended For You */}
        <section className="pt-7">
          <SectionLabel>Recommended For You</SectionLabel>
          <HScroll className="mt-4">
            <OverlayCard
              img="/img/pool-resort.jpg"
              title="Reserved for Members: 10% Off Stays in India"
              badge="Member Exclusive"
              badgeIcon="lock"
              className="w-[346px] h-[172px]"
            />
            <OverlayCard
              img="/img/renaissance-goa.jpg"
              title="Wellness Perfection: Recharge and Restore"
              badge="Members Only"
              badgeIcon="trophy"
              className="w-[346px] h-[172px]"
            />
          </HScroll>
        </section>

        {/* Destinations To Explore */}
        <section className="pt-8">
          <SectionLabel>Destinations To Explore</SectionLabel>
          <HScroll className="mt-4">
            <DestinationCard img="/img/ranthambore.jpg" name="Ranthambore" />
            <DestinationCard img="/img/shanghai.jpg" name="Shanghai" />
            <DestinationCard img="/img/hero-delhi.jpg" name="New Delhi NCR" imgPosition="center 65%" />
            <DestinationCard img="/img/goa.jpg" name="Goa" />
            <DestinationCard img="/img/kolkata-victoria.jpg" name="Kolkata" />
            <DestinationCard img="/img/mumbai-night.jpg" name="Mumbai" />
          </HScroll>
        </section>

        {/* Dine and Earn */}
        <section className="pt-8">
          <SectionLabel>Dine and Earn</SectionLabel>
          <HScroll className="mt-4">
            <WideCard
              img="/img/restaurant-interior.jpg"
              title="Restaurants Near You"
              subtitle="Explore exquisite cuisines"
            />
            <WideCard
              img="/img/biryani.jpg"
              title="Dining Earns Points"
              subtitle="Earn points on Swiggy Dineout"
              imgPosition="center 60%"
            />
            <WideCard
              img="/img/restaurant-interior.jpg"
              title="Weekend Brunch Delights"
              subtitle="Earn points on every table"
              imgPosition="80% 50%"
            />
          </HScroll>
        </section>

        {/* Explore More With Marriott */}
        <section className="pt-8 pb-[104px]">
          <SectionLabel>Explore More With Marriott</SectionLabel>
          <HScroll className="mt-4">
            <WideCard
              img="/img/courtyard-hotel.jpg"
              title="Holy Trips Down South"
              subtitle="Deals in Tirupati & Madurai"
            />
            <WideCard
              img="/img/goan-escapade.jpg"
              title="A Goan Escapade"
              subtitle="Starting at 15000 points"
            />
            <WideCard
              img="/img/mussoorie.jpg"
              title="Serene Weekend Abodes"
              subtitle="10% off stays in Mussoorie"
            />
            <WideCard
              img="/img/renaissance-goa.jpg"
              title="Poolside Escapes"
              subtitle="Earn points on every stay"
            />
          </HScroll>
        </section>
      </div>
    </div>
  );
}
