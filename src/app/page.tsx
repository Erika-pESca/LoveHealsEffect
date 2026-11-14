import React from "react";
import { HeroSection } from "@/components/inicio/HeroSection";
import { MarqueeRibbon } from "@/components/inicio/MarqueeRibbon";
import { JourneyTabsSection } from "@/components/inicio/JourneyTabsSection";
import { CommunityCirclesSection } from "@/components/inicio/CommunityCirclesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeRibbon />
      <JourneyTabsSection />
      <CommunityCirclesSection />
    </>
  );
}
