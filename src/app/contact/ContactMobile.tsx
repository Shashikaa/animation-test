"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "@/src/components/contact/Hero";
import SectionCTA from "@/src/components/contact/SectionCTA";
import SectionOne from "@/src/components/contact/SectionOne";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

// Standardized Metrics aligned with AboutMobile
const PX_PER_MAIN_PANEL = 850; 
const PAUSE_PX = 150;

export default function ContactMobile() {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock scrolling during intro
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".contact-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      gsap.set(".cta-scroll-wrapper", { yPercent: 100 });
      gsap.set(".section-one-scroll-wrapper", { yPercent: 100 });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100 });
      gsap.set(".footer-scroll-wrapper", { yPercent: 100 });
      
      gsap.set([".faq-content", ".cta-inner-mobile", ".cta-inner-desktop"], { opacity: 1 });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        }
      });
      masterTl.to(".contact-hero-bg", { scale: 1.0, duration: 2.2, ease: "power2.out" }, 0)
              .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Section Transition Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(true);
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      const MAIN_PANELS_COUNT = 4;
      const PAUSES_COUNT = 4;

      const DYNAMIC_SCROLL_TRACK = (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + (PAUSES_COUNT * PAUSE_PX);

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".contact-pin-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      tl
        // 1. HERO EXIT & CTA ENTRANCE
        .to(".contact-hero-bg", { yPercent: -15, ease: "none", duration: ACTION }, 0)
        .to(".hero-text-wrap", { opacity: 0, y: -40, ease: "power1.in", duration: ACTION * 0.75 }, 0)
        .fromTo(
          ".cta-scroll-wrapper", 
          { yPercent: 100 }, 
          { yPercent: 0, ease: "power2.inOut", duration: ACTION }, 
          0
        )

        .to({}, { duration: DEAD_SCROLL })

        // 2. SECTION ONE SLIDE UP — Anchored at bottom-0
        .fromTo(
          ".section-one-scroll-wrapper", 
          { yPercent: 100 },
          { 
            yPercent: 0, 
            ease: "power2.inOut", 
            duration: ACTION * 1.2 
          }, 
          ">"
        )

        .to({}, { duration: DEAD_SCROLL })

        // 3. FAQ SECTION ENTRANCE
        .fromTo(
          ".faq-scroll-wrapper", 
          { yPercent: 100 },
          { yPercent: 0, ease: "power2.inOut", duration: ACTION }, 
          ">"
        )

        .to({}, { duration: DEAD_SCROLL })

        // 3.5. FAQ / CTA CONTENT FADE OUT
        .addLabel("ctaFadeOut", ">")
        .to(
          [".faq-content", ".cta-scroll-wrapper .cta-inner-mobile", ".cta-scroll-wrapper .cta-inner-desktop"],
          {
            opacity: 0,
            y: -30,
            duration: ACTION * 0.1,
            ease: "power2.in",
          },
          "ctaFadeOut"
        )

        .to({}, { duration: 0 })

        // 4. FOOTER REVEAL
        .addLabel("footerStart", ">")
        .fromTo(
          ".footer-scroll-wrapper", 
          { yPercent: 100 },
          { 
            yPercent: 0, 
            ease: "power2.inOut", 
            duration: ACTION 
          }, 
          "footerStart"
        );

    }, scopeRef);

    return () => {
      ctx.revert();
      if (ScrollTrigger.isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div 
        className="contact-pin-master pin-all-contact relative w-full overflow-hidden"
        style={{ visibility: "visible" }}
      >
        
        {/* Layer 1: Hero Section */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        {/* Layer 2: CTA Section */}
        <div className="cta-scroll-wrapper gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] z-20">
          <SectionCTA />
        </div>

        {/* Layer 3: Section One (ANCHORED TO BOTTOM-0) */}
        <div className="section-one-scroll-wrapper gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto z-30">
          <SectionOne />
        </div>

        {/* Layer 4: FAQ Section */}
        <div className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-40">
          <FAQSection />
        </div>

        {/* Layer 5: Footer Wrapper Frame */}
        <div className="footer-scroll-wrapper gpu-accelerated absolute left-0 bottom-0 w-full z-50 pointer-events-none">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}