"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "@/src/components/contact/Hero";
import SectionCTA from "@/src/components/contact/SectionCTA";
import SectionOne from "@/src/components/contact/SectionOne";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer"; // Ensure your correct Footer path

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

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      // Baseline setup
      gsap.set(".contact-hero-bg", { scale: 1.3, yPercent: 0 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      // Position subsequent sections below the screen viewport
      gsap.set(".cta-scroll-wrapper", { y: "100vh" });
      gsap.set(".section-one-scroll-wrapper", { y: "100vh" });
      gsap.set(".faq-scroll-wrapper", { y: "100vh" });
      gsap.set(".footer-scroll-wrapper", { y: "100vh" });
      
      // Ensure the text wrapper opacity is initialized
      gsap.set(".faq-content", { opacity: 1 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();
      masterTl.to(".contact-hero-bg", { scale: 1.0, duration: 2.2, ease: "power2.out", onComplete: () => setIntroDone(true) }, 0)
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
          scrub: 1.2,
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
      <div className="contact-pin-master relative w-full h-screen">
        
        {/* Layer 1: Hero Component */}
        <div className="absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        {/* Layer 2: Slide-up CTA Wrapper */}
        <div className="cta-scroll-wrapper absolute inset-0 w-full h-full z-20 will-change-transform">
          <SectionCTA />
        </div>

        {/* Layer 3: Section One (Scrollable container for long cards on mobile) */}
        <div className="section-one-scroll-wrapper absolute inset-0 w-full h-full z-30 overflow-y-auto will-change-transform">
          <SectionOne />
        </div>

        {/* Layer 4: FAQ Section Layer */}
        <div className="faq-scroll-wrapper absolute inset-0 w-full h-full z-40 overflow-y-auto will-change-transform">
          <FAQSection />
        </div>

        {/* Layer 5: Footer Layer */}
        <div className="footer-scroll-wrapper absolute inset-0 w-full h-full z-50 flex flex-col justify-end pointer-events-none will-change-transform">
          <div className="w-full pointer-events-auto overflow-y-auto max-h-screen">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}