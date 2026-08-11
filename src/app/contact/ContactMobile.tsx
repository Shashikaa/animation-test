"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactHero from "@/src/components/contact/Hero";
import SectionCTA from "@/src/components/contact/SectionCTA";
import SectionOne from "@/src/components/contact/SectionOne";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

const PX_PER_MAIN_PANEL = 850;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

export default function ContactMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Step-by-step panel positioning matching the AboutMobile standard
      gsap.set(".contact-hero-panel", { yPercent: 0, force3D: true });
      gsap.set(".cta-scroll-wrapper", { yPercent: 100, zIndex: 20, visibility: "visible", force3D: true });
      gsap.set(".section-one-scroll-wrapper", { yPercent: 100, zIndex: 30, visibility: "visible", force3D: true });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, zIndex: 40, visibility: "visible", force3D: true });

      gsap.set(
        [".cta-scroll-wrapper .cta-inner-mobile", ".cta-scroll-wrapper .cta-inner-desktop"],
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );

      gsap.set(".footer-scroll-wrapper", { yPercent: 100, zIndex: 50, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (!isAndroid) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          lockAxis: true,
        });
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const UNIFIED_EASE = "power1.inOut";

      const MAIN_PANELS_COUNT = 4;
      const PAUSES_COUNT = 4;

      const vh = window.innerHeight || BASELINE_VH;
      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL + PAUSES_COUNT * PAUSE_PX) * scaleFactor;

      const tl = gsap.timeline({
        defaults: { ease: UNIFIED_EASE, lazy: true },
        scrollTrigger: {
          trigger: ".contact-pin-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: isAndroid ? 0.2 : 0.6,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // --- TRANSITION 1: Hero -> CTA ---
      tl.to(".cta-scroll-wrapper", { yPercent: 0, duration: ACTION })
        .to(".contact-hero-bg", { scale: 1.0, yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 2: CTA -> Section One ---
      tl.to(".section-one-scroll-wrapper", { yPercent: 0, duration: ACTION })
        .to(".cta-scroll-wrapper", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 3: Section One -> FAQ ---
      tl.to(".faq-scroll-wrapper", { yPercent: 0, duration: ACTION })
        .to(".section-one-scroll-wrapper", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 4: FAQ -> Footer ---
      tl.addLabel("footerStart", ">")
        .set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".footer-scroll-wrapper",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power1.out" },
          "footerStart"
        );
    }, scopeRef);

    return () => {
      ctx.revert();
      if (!isAndroid) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div
        className="contact-pin-master pin-all-contact relative w-full overflow-hidden h-[100dvh]"
        style={{ visibility: "visible" }}
      >
        {/* Layer 1: Hero */}
        <div className="contact-hero-panel gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <ContactHero isMobile={true} />
        </div>

        {/* Layer 2: CTA */}
        <div
          className="cta-scroll-wrapper gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh]"
          style={{ zIndex: 20 }}
        >
          <SectionCTA />
        </div>

        {/* Layer 3: Section One */}
        <div
          className="section-one-scroll-wrapper gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto"
          style={{ zIndex: 30 }}
        >
          <SectionOne />
        </div>

        {/* Layer 4: FAQ */}
        <div
          className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 40 }}
        >
          <FAQSection />
        </div>

        {/* Layer 5: Footer */}
        <div
          className="footer-scroll-wrapper gpu-accelerated absolute left-0 bottom-0 w-full"
          style={{ zIndex: 50, pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}