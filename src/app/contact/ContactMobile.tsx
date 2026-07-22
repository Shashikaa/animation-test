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

type ContactProps = {
  preloaderDone: boolean;
};

export default function ContactMobile({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock scrolling cleanly during intro sequence without disabling touch events
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Handle iOS address bar expansion/collapse gracefully
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (Math.abs(currentHeight - lastHeight) > 40) {
        lastHeight = currentHeight;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: false,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      // Baseline setup
      gsap.set(".contact-hero-bg", { scale: 1.3, yPercent: 0, force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });
      
      // Position subsequent sections below the screen viewport
      gsap.set(".cta-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".section-one-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".faq-scroll-wrapper", { y: "100vh", force3D: true });
      gsap.set(".footer-scroll-wrapper", { y: "100vh", force3D: true });
      
      // Ensure the text wrapper opacity is initialized
      gsap.set(".faq-content", { opacity: 1, force3D: true });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;
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
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".contact-pin-master",
          start: "top top",
          end: "+=9500", // Expanded tracking space to make room for all mobile sections comfortably
          pin: true,
          pinType: "fixed", // Forces GSAP to use fixed positioning which handles iOS URL bar collapse cleanly
          scrub: 1.2, // Weighted inertia matching AboutMobile for smooth mobile scrolling
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });

      tl
        // ─── PHASE 1: Hero content fades out / CTA moves up ───
        .to(".contact-hero-bg", { yPercent: -15, ease: "none", duration: 2 }, 0)
        .to(".hero-text-wrap", { opacity: 0, y: -40, ease: "power1.in", duration: 1.5 }, 0)
        .to(".cta-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 2.5 }, 0)

        // ─── PHASE 2: Section One comes up ───
        .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 2.5 }, 2.5)

        // ─── PHASE 3: FAQ Section glides over Section One ───
        .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 2.5 }, 5.0)

        // ─── PHASE 4: FAQ Content Fades out (leaving background) ───
        .to(".faq-content", { opacity: 0, y: -20, ease: "power2.in", duration: 1.5 }, 7.5)

        // ─── PHASE 5: Footer slides up over FAQ Background ───
        .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: 2.0 }, 8.5);

    }, scopeRef);
    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef} className="min-h-screen w-full bg-zinc-950 text-white overflow-hidden">
      <style jsx global>{`
        /* Pin wrapper fills 100% of visible viewport height */
        .pin-all-contact {
          height: 100vh;
          height: 100dvh;
          width: 100%;
        }

        /* Overrides GSAP inline styles on pin-spacer to prevent viewport black gaps on iOS */
        .pin-spacer {
          min-height: 100dvh !important;
        }

        .pin-spacer > .pin-all-contact {
          height: 100% !important;
          max-height: none !important;
        }

        .gpu-accelerated {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>

      <div className="contact-pin-master pin-all-contact relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Component */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        {/* Layer 2: Slide-up CTA Wrapper */}
        <div className="cta-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-20">
          <SectionCTA />
        </div>

        {/* Layer 3: Section One (Scrollable container for long cards on mobile) */}
        <div className="section-one-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-30 overflow-y-auto">
          <SectionOne />
        </div>

        {/* Layer 4: FAQ Section Layer */}
        <div className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-40 overflow-y-auto">
          <FAQSection />
        </div>

        {/* Layer 5: Footer Layer */}
        <div className="footer-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-50 flex flex-col justify-end pointer-events-none">
          <div className="w-full pointer-events-auto overflow-y-auto max-h-screen">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}