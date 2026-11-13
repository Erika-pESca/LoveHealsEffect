import React from "react";
import { HeroSection } from "@/modules/inicio/components/HeroSection";
import { MarqueeRibbon } from "@/modules/inicio/components/MarqueeRibbon";
import { JourneyTabsSection } from "@/modules/inicio/components/JourneyTabsSection";
import { CommunityCirclesSection } from "@/modules/inicio/components/CommunityCirclesSection";

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
