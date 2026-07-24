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

// Standardized Metrics to align with AboutMobile feel
const PX_PER_MAIN_PANEL = 850; 
const PAUSE_PX = 100;

export default function ContactMobile() {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".contact-hero-bg", { scale: 1.3, yPercent: 0, force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      
      gsap.set(".cta-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".section-one-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".faq-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".footer-scroll-wrapper", { y: "100vh", force3D: true });
      
      gsap.set(".faq-content", { opacity: 1, force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

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

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;

      // Contact Page: 4 Main transitions (Hero->CTA, CTA->Sec1, Sec1->FAQ, FAQ->Footer) + 3 Dead Scroll pauses
      const MAIN_PANELS_COUNT = 4;
      const PAUSES_COUNT = 3;

      const DYNAMIC_SCROLL_TRACK = (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + (PAUSES_COUNT * PAUSE_PX);

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".contact-pin-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: 1.2, // Kept to 1.2 across all pages
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      tl
        .to(".contact-hero-bg", { yPercent: -15, ease: "none", duration: ACTION }, 0)
        .to(".hero-text-wrap", { opacity: 0, y: -40, ease: "power1.in", duration: ACTION * 0.75 }, 0)
        .to(".cta-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, 0)

        .to({}, { duration: DEAD_SCROLL })

        .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, ">")

        .to({}, { duration: DEAD_SCROLL })

        .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, ">")

        .to({}, { duration: DEAD_SCROLL })

.addLabel("footerStart", ">")
// Fade out FAQ content rapidly right as the footer begins moving
.to(".faq-content", { 
  opacity: 0, 
  y: -40, 
  ease: "power3.in", // Sharper ease for a faster visual exit
  duration: ACTION * 0.1 // Reduced from 0.4 to 0.25 so it vanishes immediately
}, "footerStart")

.to(".footer-scroll-wrapper", { 
  y: "0vh", 
  ease: "power2.out", 
  duration: ACTION 
}, "footerStart");

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef} className="min-h-screen w-full bg-zinc-950 text-white overflow-hidden">
      <div className="contact-pin-master pin-all-contact relative w-full overflow-hidden">
        
        <div className="gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        <div className="cta-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-20">
          <SectionCTA />
        </div>

        <div className="section-one-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-30">
          <SectionOne />
        </div>

        <div className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-40">
          <FAQSection />
        </div>

        <div className="footer-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-50 flex flex-col justify-end pointer-events-none">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}