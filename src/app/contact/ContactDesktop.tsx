"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "../../components/contact/Hero";
import SectionCTA from "@/src/components/contact/SectionCTA";
import SectionOne from "@/src/components/contact/SectionOne";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer"; // Ensure your correct Footer path

gsap.registerPlugin(ScrollTrigger);

type ContactProps = {
  preloaderDone: boolean;
};

export default function ContactDesktop({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".contact-hero-bg", { scale: 1.3, y: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      gsap.set(".section-one-scroll-wrapper", { y: "100vh" });
      gsap.set(".faq-scroll-wrapper", { y: "100vh" }); 
      gsap.set(".footer-scroll-wrapper", { y: "100vh" }); // Set footer off-screen safely
      gsap.set(".faq-content", { opacity: 1 }); // Clear layout state
      
      gsap.set(".contact-one-bg", { scale: 1, yPercent: 0 });
      gsap.set(".contact-right-scroll-track", { y: 0 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      introTl.to(".contact-hero-bg", { scale: 1.1, duration: 2.2, ease: "power2.out" }, 0)
             .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;
    
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const cardContainer = document.querySelector(".contact-cards-container");
        const scrollDistance = cardContainer ? cardContainer.getBoundingClientRect().height + 96 : window.innerHeight;

        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".contact-hero-master",
            start: "top top",
            end: "+=14000", // Expanded timeline to handle footer entry smoothly
            pin: true,
            scrub: 1.2, 
            invalidateOnRefresh: true,
          }
        });

        scrollTl
          // ─── PHASE 1: Previous components shift out ───
          .to(".contact-hero-bg", { y: -100, ease: "none", duration: 2 }, 0)
          .to(".cta-scroll-wrapper", { yPercent: -100, ease: "power2.inOut", duration: 2 }, 0)
          
          // ─── PHASE 2: Section One glides up safely ───
          .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 2 }, 2)
          
          // ─── PHASE 3: Section One Cards Track Scrolls up ───
          .to(".contact-one-bg", { yPercent: -35, ease: "none", duration: 5 }, 4)
          .to(".contact-right-scroll-track", { y: -scrollDistance, ease: "power1.inOut", duration: 5 }, 4)

          // ─── PHASE 4: FAQ Section glides up seamlessly ───
          .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 3.5 }, 9)
          
          // ─── PHASE 5: FAQ Text Content Fades out (Leaving background intact) ───
          .to(".faq-content", { opacity: 0, y: -30, ease: "power2.in", duration: 2 }, 13)

          // ─── PHASE 6: Footer Slides Up over the FAQ background ───
          .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: 2.5 }, 14);

      }, scopeRef);

      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="contact-hero-master relative w-full h-screen overflow-hidden">
        
        <div className="w-full h-full relative z-10">
          <ContactHero />
        </div>

        <div className="cta-scroll-wrapper absolute top-full left-0 w-full h-screen z-20 will-change-transform">
          <SectionCTA />
        </div>

        <div className="section-one-scroll-wrapper absolute top-0 left-0 w-full h-screen z-30 will-change-transform">
          <SectionOne />
        </div>

        {/* FAQ Section Layer */}
        <div className="faq-scroll-wrapper absolute top-0 left-0 w-full h-screen z-40 will-change-transform">
          <FAQSection />
        </div>

        {/* Footer Container Layer - Absolute layout aligns to the same pin frame */}
        <div className="footer-scroll-wrapper absolute top-0 left-0 w-full h-screen z-50 flex flex-col justify-end pointer-events-none will-change-transform">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}