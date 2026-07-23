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

  // Lock scrolling cleanly during preloader / intro
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Refresh ScrollTrigger only on width/orientation change
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

  // Baseline setup matching AboutMobile structure
  useLayoutEffect(() => {
    if (!preloaderDone) return;

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
  }, [preloaderDone]);

  // Intro Sequence
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

// Master Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 2.0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".contact-pin-master",
          start: "top top",
          end: "+=5000",
          pin: true,
          pinType: "fixed",
          scrub: 1.2,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      tl
        // ─── PHASE 1: Hero content fades out / CTA moves up ───
        .to(".contact-hero-bg", { yPercent: -15, ease: "none", duration: ACTION }, 0)
        .to(".hero-text-wrap", { opacity: 0, y: -40, ease: "power1.in", duration: ACTION * 0.75 }, 0)
        .to(".cta-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, 0)

        // ─── PHASE 2: Section One comes up ───
        .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, ">")

        // ─── PHASE 3: FAQ Section glides over Section One ───
        .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: ACTION }, ">")

        // ─── PHASE 4 & 5: FAQ Fades out quickly WHILE Footer slides up simultaneously ───
        .addLabel("footerStart", ">")
        
        // Fast fade-out (completes in the first 40% of the footer's movement)
        .to(".faq-content", { 
          opacity: 0, 
          y: -40, 
          ease: "power2.in", 
          duration: ACTION * 0.4 
        }, "footerStart")
        
        // Footer starts sliding up at the exact same time
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
        
        {/* Layer 1: Hero Component */}
        <div className="gpu-accelerated absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        {/* Layer 2: Slide-up CTA Wrapper */}
        <div className="cta-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-20">
          <SectionCTA />
        </div>

        {/* Layer 3: Section One */}
        <div className="section-one-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-30">
          <SectionOne />
        </div>

        {/* Layer 4: FAQ Section Layer */}
        <div className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-40">
          <FAQSection />
        </div>

        {/* Layer 5: Footer Layer */}
        <div className="footer-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full z-50 flex flex-col justify-end pointer-events-none">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}