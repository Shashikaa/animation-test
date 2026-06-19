"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "../../components/contact/Hero";
// Import your subsequent sections here
// import ContactFormSection from "@/src/components/Contact/FormSection"; 

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone: boolean;
};

export default function ContactDesktop({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);

  // Sync preloader and scroll restoration
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Initial GSAP setup
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      // Setup initial states
      gsap.set(".contact-hero-bg", { scale: 1.3, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".contact-hero-top-layer", { width: "100%" });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // Entrance Animation
  useEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      introTl.to(".contact-hero-bg", { scale: 1.1, duration: 2.2, ease: "power2.out" }, 0)
             .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // Scroll Animations
  useEffect(() => {
    if (!introDone) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".contact-hero-master",
          start: "top top",
          end: "+=4000", // Adjust based on your content length
          pin: true,
          scrub: 1.5,
        }
      });

      // Mirroring Service logic: Compress Hero
      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -40, duration: 0.5 }, 0)
              .to(".contact-hero-top-layer", { width: "calc(100% - 600px)", duration: 1.5, ease: "power1.inOut" }, 0.1);

      // Add your subsequent sections animations here
    }, scopeRef);
    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="contact-hero-master relative w-full h-screen overflow-hidden">
        <ContactHero />
        {/* Place subsequent sections here with absolute positioning */}
      </div>
    </div>
  );
}