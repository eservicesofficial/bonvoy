"use client";

import { Heart, Plus } from "lucide-react";
import { SectionLabel, HScroll, MarriottLogo } from "@/components/bonvoy/primitives";
import { useToast } from "@/hooks/use-toast";
import { Pressable, TapCard } from "@/components/bonvoy/motion";

function LovedCard({ img, name }: { img: string; name: string }) {
  const { toast } = useToast();
  return (
    <TapCard className="shrink-0 w-[178px] rounded-[12px] overflow-hidden bg-[#343130] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      <div className="relative h-[178px]">
        { }
        <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        <Pressable
          aria-label={`Save ${name} to wishlist`}
          scale={0.85}
          onClick={() => toast({ title: "Saved to wishlist", description: name })}
          className="absolute top-2 right-2 w-[30px] h-[30px] flex items-center justify-center rounded-full bg-black/35"
        >
          <Heart size={17} className="text-white" strokeWidth={2.2} />
        </Pressable>
        <div className="absolute bottom-2 left-2 opacity-95">
          <div className="scale-[0.42] origin-bottom-left [&_span]:!text-white">
            <MarriottLogo scale={0.5} />
          </div>
        </div>
      </div>
      <p className="px-3 py-[12px] text-[15px] font-medium text-white leading-snug min-h-[64px]">
        {name}
      </p>
    </TapCard>
  );
}

export default function WishlistsScreen() {
  const { toast } = useToast();
  return (
    <div className="absolute inset-0 bg-[#2E2C2B]">
      <div className="h-full overflow-y-auto no-scrollbar px-0 pt-[calc(24px+env(safe-area-inset-top,0px))] pb-[110px]">
        <div className="px-5 flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-white">Wishlists</h1>
          <Pressable
            aria-label="New wishlist"
            scale={0.85}
            onClick={() => toast({ title: "New wishlist", description: "Name your wishlist to start saving hotels." })}
            className="text-white p-1"
          >
            <Plus size={26} strokeWidth={2.2} />
          </Pressable>
        </div>

        <div className="mx-5 mt-7 border border-dashed border-[#7A7774] rounded-[10px] px-8 pt-10 pb-9 text-center">
          <Heart size={44} className="text-white mx-auto" fill="#FFFFFF" strokeWidth={1.5} />
          <p className="mt-5 text-[20px] font-semibold text-white">Create your first wishlist</p>
          <p className="mt-2 text-[15px] text-[#A19E9B] leading-relaxed">
            As you search, tap the heart icon to save your favorite hotels to a wishlist.
          </p>
          <Pressable
            onClick={() => toast({ title: "Create Wishlist", description: "Wishlist creation is part of this demo." })}
            scale={0.96}
            className="mt-6 bg-white text-[#1B1918] text-[15px] font-semibold rounded-full px-6 py-[12px]"
          >
            Create Wishlist
          </Pressable>
        </div>

        <section className="pt-9">
          <SectionLabel>Most Loved Properties</SectionLabel>
          <HScroll className="mt-4">
            <LovedCard img="/img/nyc-marriott.jpg" name="New York Marriott Marquis" />
            <LovedCard img="/img/orlando-marriott.jpg" name="Orlando World Center Marriott" />
            <LovedCard img="/img/mumbai-night.jpg" name="The Ritz-Carlton, Bangalore" />
          </HScroll>
        </section>
      </div>
    </div>
  );
}
