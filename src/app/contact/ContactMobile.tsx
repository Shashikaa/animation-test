"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "@/src/components/contact/Hero";
// Import your additional sections here, e.g., Footer, Form

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
      gsap.set(".contact-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".contact-hero-top-layer", { clipPath: "inset(0px 0px 0px 0px)" });
      
      // Setup for subsequent sections (e.g., footer)
      gsap.set(".contact-footer-wrap", { visibility: "hidden", y: "100%" });
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
          end: "+=4000",
          pin: true,
          scrub: 0.2,
        }
      });

      // Hero Animation
      tl.to(".hero-text-wrap", { opacity: 0, y: -40, duration: 2.0 }, 0)
        .to(".contact-hero-top-layer", { clipPath: "inset(0px 0px 320px 0px)", duration: 2.0, ease: "power2.inOut" }, 0)
        .to(".contact-hero-bg", { yPercent: 5, duration: 2.0, ease: "power2.inOut" }, 0);

      // Add your subsequent section reveals here
      tl.set(".contact-footer-wrap", { visibility: "visible" })
        .to(".contact-footer-wrap", { y: "0%", duration: 2.0, ease: "power2.inOut" });

    }, scopeRef);
    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef} className="min-h-screen w-full bg-zinc-950 text-white overflow-hidden">
      <div className="contact-pin-master relative w-full h-screen">
        
        {/* Layer 1: Hero */}
        <div className="absolute inset-0 w-full h-full z-10">
          <ContactHero />
        </div>

        {/* Layer 2: Footer / Other Content */}
        <div className="contact-footer-wrap absolute inset-0 w-full h-full z-20" style={{ transform: "translateY(100%)" }}>
           {/* Add your Contact form or Footer component here */}
        </div>

      </div>
    </div>
  );
}