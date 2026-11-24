"use client";

import { useRef, useState } from "react";
import {
  SectionLabel,
  HScroll,
  HotelRowCard,
  OverlayCard,
  DestinationCard,
  WideCard,
  SearchPill,
} from "@/components/bonvoy/primitives";

export default function BookScreen() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [_, setStuck] = useState(false);

  const onScroll = () => {
    setStuck((scrollRef.current?.scrollTop ?? 0) > 10);
  };

  return (
    <div className="absolute inset-0 bg-[#2B2928]">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto no-scrollbar">
        {/* Sticky solid search header */}
        <div className="sticky top-0 z-30 bg-[#3A3736]">
          <div className="pt-[calc(16px+env(safe-area-inset-top,0px))] px-5 pb-[14px]">
            <SearchPill onStuckBg />
          </div>
        </div>

        <section className="pt-6">
          <SectionLabel>Recently Viewed</SectionLabel>
          <HScroll className="mt-4">
            <HotelRowCard img="/img/westin-kolkata.jpg" name="The Westin Kolkata Rajarhat" />
            <HotelRowCard img="/img/fairfield-room.jpg" name="Fairfield by Marriott Kolkata" />
          </HScroll>
        </section>

        <section className="pt-7">
          <SectionLabel>Recent Stays</SectionLabel>
          <HScroll className="mt-4">
            <HotelRowCard
              img="/img/fern-lobby.jpg"
              name="The Fern Residency Bengaluru, Yeshwanthpur, Series by Marriott"
            />
          </HScroll>
        </section>

        <section className="pt-7">
          <SectionLabel>Hotel Deals</SectionLabel>
          <HScroll className="mt-4">
            <OverlayCard
              img="/img/mumbai-night.jpg"
              title="The St. Regis Mumbai"
              subtitle="Exclusive 10% savings"
              className="w-[346px] h-[378px]"
            />
            <OverlayCard
              img="/img/renaissance-goa.jpg"
              title="Renaissance Goa Baga-Arpora Hotel"
              subtitle="24-hour check-in & check-out"
              className="w-[346px] h-[378px]"
              imgPosition="center 55%"
            />
            <OverlayCard
              img="/img/pool-resort.jpg"
              title="JW Marriott Bengaluru"
              subtitle="Weekend specials"
              className="w-[346px] h-[378px]"
            />
          </HScroll>
        </section>

        <section className="pt-8">
          <SectionLabel>Featured Destinations</SectionLabel>
          <HScroll className="mt-4">
            <DestinationCard img="/img/bangkok.jpg" name="Bangkok" />
            <DestinationCard img="/img/kuala-lumpur.jpg" name="Kuala Lumpur" />
            <DestinationCard img="/img/bali.jpg" name="Bali" />
            <DestinationCard img="/img/phuket.jpg" name="Phuket" />
          </HScroll>
        </section>

        <section className="pt-8 pb-[104px]">
          <SectionLabel>Experience More With Marriott</SectionLabel>
          <HScroll className="mt-4">
            <WideCard
              img="/img/bangkok-rooftop.jpg"
              title="Bangkok Year-End Bliss"
              subtitle="Festivals, fun & serenity"
            />
            <WideCard
              img="/img/goan-escapade.jpg"
              title="Malaysia Naturally Amazing"
              subtitle="Breathtaking escapes"
              imgPosition="center 40%"
            />
          </HScroll>
        </section>
      </div>
    </div>
  );
}
