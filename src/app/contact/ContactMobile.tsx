"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";
import ContactHero from "@/src/components/contact/Hero";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const SectionCTA = dynamic(() => import("@/src/components/contact/SectionCTA"));
const SectionOne = dynamic(() => import("@/src/components/contact/SectionOne"));
const FAQSection = dynamic(() => import("@/src/components/contact/FAQSection"));
const Footer = dynamic(() => import("@/src/components/Footer"));

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const { smootherRef } = useSite();

  // Hero intro hook maintained for preloader and entrance animation
  const { shouldLoadRest } = useHeroIntro(scopeRef, {
    isMobile: true,
    introDurationMs: 2800,
    unlockScrollEarlyMs: 1800,
  });

  useEffect(() => {
    if (shouldLoadRest) {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      const lenis = smootherRef?.current;
      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }
    }
  }, [shouldLoadRest, smootherRef]);

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      {/* Hero Section with animation target scope */}
      <section className="relative w-full min-h-[100dvh]">
        <ContactHero isMobile={true} />
      </section>

      {/* Natural scrolling page content */}
      {shouldLoadRest && (
        <>
          <section className="relative w-full">
            <SectionCTA />
          </section>

          <section className="relative w-full">
            <SectionOne />
          </section>

          <section className="relative w-full">
            <FAQSection />
          </section>

          <footer className="relative w-full">
            <Footer />
          </footer>
        </>
      )}
    </div>
  );
}